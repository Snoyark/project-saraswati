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

// New component for streaming text
const StreamingText: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Adjust speed here

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

// commenting this out since this is causing compilation issues on the client side
// const get_retrieval_chain = async (
//   topic_name: string, 
//   setRetrievalChain: React.Dispatch<React.SetStateAction<any | undefined>>
// ) => {
//     const retrievalChain = await create_retrieval_chain(topic_name);
//     setRetrievalChain(retrievalChain);
// }

const ChatInterface = (args: SearchArgs) => {
  const initial_message: Message = {
    id: Date.now().toString(),
    text: `Hello there! You wanted to learn about ${args.topic_name} today - how can I help?`,
    sender: 'assistant',
    timestamp: new Date(),
    isStreaming: true, // Add streaming to initial message
  };

  const [messages, setMessages] = useState<Message[]>([initial_message]);
  const [retrievalChain, setRetrievalChain] = useState<RetrievalChain>();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // get_retrieval_chain(args.topic_name, setRetrievalChain);
  // if (retrievalChain) {
  //   setIsLoading(false);
  // }

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
  };

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
        isStreaming: true, // Add streaming to assistant messages
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