'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Container, MessagesArea, MessageRow, MessageBubble, MessageText, TimeStamp, LoadingMessage, InputArea, Form, TextArea, SendButton, SendIcon } from './styles/Search';
import { Topic } from '@/utils/constants';
import { v4 } from 'uuid';
import markdownit from 'markdown-it'
import parse from 'html-react-parser';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const md = markdownit();

type SearchArgs = {
  topic: Topic;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/chat?customer_id=${v4()}}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsLoading(false);
      
      setMessages([{
        id: Date.now().toString(),
        text: `Hello there! How can I help you learn something today?`,
        sender: 'assistant',
        timestamp: new Date()
      }]);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  if (socketRef.current !== null && socketRef.current?.readyState === WebSocket.OPEN) {
    socketRef.current.onmessage = async (event: MessageEvent) => {
      try {
        const chunk = event.data instanceof Blob ? await event.data.text() : event.data;
        if (chunk === 'END_SEQUENCE') {
          // Add streaming message to main messages array if it exists
          if (streamingMessage) {
            setMessages(prev => [...prev, streamingMessage]);
            setStreamingMessage(null);
          }
          setIsLoading(false);
          return;
        }
        // Either create new streaming message or update existing one
        setStreamingMessage(prev => {
          if (!prev) {
            return {
              id: Date.now().toString(),
              text: chunk,
              sender: 'assistant',
              timestamp: new Date()
            };
          }
          return {
            ...prev,
            text: prev.text + chunk
          };
        });
      } catch (error) {
        console.error('Error processing message:', error);
        setIsLoading(false);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };
    
    socketRef.current.onclose = () => {
      setIsConnected(false);
      setIsLoading(false);
    };
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !isConnected) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    const temp_messages = [...messages, userMessage];

    setMessages(temp_messages);
    setInputText('');
    setIsLoading(true);
    setStreamingMessage(null); // Reset streaming message

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const chatHistory = temp_messages.map(msg => ({
        role: msg.sender,
        content: msg.text
      }));
      
      socketRef.current.send(JSON.stringify({
        chat_history: chatHistory,
        current_question: userMessage.text,
      }));
    }
  };

  // Combine all messages for display
  const displayMessages = streamingMessage 
    ? [...messages, streamingMessage]
    : messages;

  return (
    <Container>
      <MessagesArea>
        {displayMessages.map((message) => (
          <MessageRow key={message.id} isUser={message.sender === 'user'}>
            <MessageBubble isUser={message.sender === 'user'}>
              {/* <MessageText> */}
                {parse(md.render(message.text))}
              {/* </MessageText> */}
              <TimeStamp>{message.timestamp.toLocaleTimeString()}</TimeStamp>
            </MessageBubble>
          </MessageRow>
        ))}

        {isLoading && !streamingMessage && (
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