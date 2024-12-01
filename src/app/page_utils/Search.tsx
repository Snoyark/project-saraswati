'use client'
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafb;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageRow = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: ${props => props.isUser ? '#3b82f6' : '#ffffff'};
  color: ${props => props.isUser ? '#ffffff' : '#000000'};
  border: ${props => props.isUser ? 'none' : '1px solid #e5e7eb'};
`;

const MessageText = styled.p`
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const TimeStamp = styled.p`
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.25rem;
  opacity: 0.7;
`;

const InputArea = styled.div`
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 1rem;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  min-height: 44px;
  max-height: 8rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#3b82f6' : '#2563eb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #6b7280;
`;

const SendIcon = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type SearchArgs = {
  topic_name: string;
};

const ChatInterface = (args: SearchArgs) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate LLM API call
      const response = await new Promise(resolve => 
        setTimeout(() => resolve("This is a simulated LLM response."), 1000)
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response as string,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <MessagesArea>
        {messages.map((message) => (
          <MessageRow key={message.id} isUser={message.sender === 'user'}>
            <MessageBubble isUser={message.sender === 'user'}>
              <MessageText>{message.text}</MessageText>
              <TimeStamp>
                {message.timestamp.toLocaleTimeString()}
              </TimeStamp>
            </MessageBubble>
          </MessageRow>
        ))}
        {isLoading && (
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
            placeholder="Type your message..."
            rows={1}
          />
          <SendButton type="submit" disabled={isLoading || !inputText.trim()}>
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