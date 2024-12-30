'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Container, MessagesArea, MessageRow, MessageBubble, MessageText, TimeStamp, LoadingMessage, InputArea, Form, TextArea, SendButton, SendIcon } from './styles/Search';
import { create_retrieval_chain, RetrievalChain } from '@/utils/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatHistory {
  role: string;
  content: string;
}

const StreamingText: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);

      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <>{displayedText}</>;
};

type SearchArgs = {
  topic_name: string;
};

const ChatInterface = (args: SearchArgs) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  let isStreamingResponse = false;

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/${args.topic_name}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      setIsLoading(false);
      
      // Add initial message after connection
      const initial_message: Message = {
        id: Date.now().toString(),
        text: `Hello there! You wanted to learn about ${args.topic_name} today - how can I help?`,
        sender: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages([initial_message]);
      setChatHistory([{ role: 'assistant', content: initial_message.text }]);
    };

    ws.onmessage = async (event: MessageEvent) => {
      // Convert blob to text
      let chunk: string;
      if (event.data instanceof Blob) {
        chunk = await event.data.text();
      } else {
        chunk = event.data;
      }

      console.log(`received chunk: ${chunk}`)

      if (chunk === 'END_SEQUENCE') {
        // end the message
        console.log('reached the end sequence')
        isStreamingResponse = false;
        return;
      }

      console.log(`streamingMessageId: ${streamingMessageId}, isStreamingResponse: ${isStreamingResponse}, messages: ${JSON.stringify(messages)}`)
      if (isStreamingResponse) {
        // Update existing streaming message
        messages[messages.length - 1].text += chunk
        console.log(`updated messages: ${JSON.stringify(messages)}`)
        setMessages(messages);
      } else {
        // Create new streaming message
        const newMessageId = Date.now().toString();
        setStreamingMessageId(newMessageId);
        isStreamingResponse = true;
        console.log(`messages before: ${JSON.stringify(messages)}`)
        messages.push({
          id: newMessageId,
          text: chunk,
          sender: 'assistant',
          timestamp: new Date(),
          isStreaming: true,
        })
        console.log(`messages after: ${JSON.stringify(messages)}`)
        setMessages(messages);
      }
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
      setIsLoading(false);
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [args.topic_name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const completeStreaming = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
    
    // Find the completed message and add it to chat history
    const completedMessage = messages.find(msg => msg.id === messageId);
    if (completedMessage) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: completedMessage.text 
      }]);
    }
    
    setStreamingMessageId(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage.text }]);
    setInputText('');
    setIsLoading(true);
    setStreamingMessageId(null); // Reset streaming message ID for new response

    // Send message through WebSocket with chat history
    if (socket?.readyState === WebSocket.OPEN) {
      const websocketMessage = {
        msg: userMessage.text,
        chat_history: chatHistory
      };
      socket.send(JSON.stringify(websocketMessage));
    } else {
      console.error('WebSocket is not connected');
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <MessagesArea>
        {messages.map((message) => (
          <MessageRow key={message.id} isUser={message.sender === 'user'}>
            <MessageBubble isUser={message.sender === 'user'}>
              <MessageText>
                {message.isStreaming ? (
                  <StreamingText 
                    text={message.text} 
                    onComplete={() => completeStreaming(message.id)}
                  />
                ) : (
                  message.text
                )}
              </MessageText>
              <TimeStamp>
                {message.timestamp.toLocaleTimeString()}
              </TimeStamp>
            </MessageBubble>
          </MessageRow>
        ))}
        {isLoading && !streamingMessageId && (
          <MessageRow isUser={false}>
            <LoadingMessage>
              <MessageText>Thinking...</MessageText>
            </LoadingMessage>
          </MessageRow>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <InputArea>
        <Form onSubmit={handleSubmit}>
          <TextArea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            rows={1}
            disabled={!isConnected}
          />
          <SendButton type="submit" disabled={isLoading || !inputText.trim() || !isConnected}>
            <SendIcon 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
            >
              <path 
                d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
                fill="currentColor"
              />
            </SendIcon>
          </SendButton>
        </Form>
      </InputArea>
    </Container>
  );
};

export default ChatInterface;