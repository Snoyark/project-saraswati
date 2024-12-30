'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Container, MessagesArea, MessageRow, MessageBubble, MessageText, TimeStamp, LoadingMessage, InputArea, Form, TextArea, SendButton, SendIcon } from './styles/Search';

interface Message {
  id: string;
  text: string;
  sender: string; // 'user' | 'assistant';
  timestamp: Date;
}

type SearchArgs = {
  topic_name: string;
};

const ChatInterface = ({ topic_name }: SearchArgs) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/${topic_name}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsLoading(false);
      
      // Add initial greeting
      setMessages([{
        id: Date.now().toString(),
        text: `Hello there! You wanted to learn about ${topic_name} today - how can I help?`,
        sender: 'assistant',
        timestamp: new Date()
      }]);
    };

    ws.onmessage = async (event: MessageEvent) => {
      const chunk = event.data instanceof Blob ? await event.data.text() : event.data;
      
      if (chunk === 'END_SEQUENCE') {
        // Create a new message with the accumulated text
        if (currentMessage) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: currentMessage,
            sender: 'assistant',
            timestamp: new Date()
          }]);
          setCurrentMessage('');
        }
        setIsLoading(false);
        return;
      }

      // Accumulate the incoming chunks
      setCurrentMessage(prev => prev + chunk);
    };

    ws.onerror = () => setIsLoading(false);
    ws.onclose = () => {
      setIsConnected(false);
      setIsLoading(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [topic_name]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentMessage]);

  // Auto-resize input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !isConnected) return;

    // Add user message
    const newMessages = [...messages, {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Send to WebSocket
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const chatHistory = newMessages.map(msg => ({
        role: msg.sender,
        content: msg.text
      }));
      
      socketRef.current.send(JSON.stringify({
        msg: inputText.trim(),
        chat_history: chatHistory
      }));
    }
  };

  return (
    <Container>
      <MessagesArea>
        {messages.map((message) => (
          <MessageRow key={message.id} isUser={message.sender === 'user'}>
            <MessageBubble isUser={message.sender === 'user'}>
              <MessageText>{message.text}</MessageText>
              <TimeStamp>{message.timestamp.toLocaleTimeString()}</TimeStamp>
            </MessageBubble>
          </MessageRow>
        ))}
        
        {currentMessage && (
          <MessageRow isUser={false}>
            <MessageBubble isUser={false}>
              <MessageText>{currentMessage}</MessageText>
              <TimeStamp>{new Date().toLocaleTimeString()}</TimeStamp>
            </MessageBubble>
          </MessageRow>
        )}

        {isLoading && !currentMessage && (
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