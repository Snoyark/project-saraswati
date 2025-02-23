'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  MessagesArea,
  MessageRow,
  MessageBubble,
  MessageText,
  TimeStamp,
  LoadingMessage,
  InputArea,
  Form,
  TextArea,
  SendButton,
  SendIcon,
  SelectionContainer,
  SelectionTitle,
  ButtonGroup,
  SelectionButton,
  PaperInputContainer,
  PaperInputForm,
  PaperInput,
  TopBanner,
  BannerContent,
  BannerText,
  BannerButtons,
  BannerButton
} from './styles/Search';
import { Topic } from '@/utils/constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type SearchMode = 'general' | 'deep-dive' | null;

type SearchArgs = {
  topic: Topic;
};

const ChatInterface = ({ topic }: SearchArgs) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [showPaperInput, setShowPaperInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const topic_name = topic.url_name;

  const SelectionInterface = () => (
    <SelectionContainer>
      <SelectionTitle>How would you like to explore {topic.name}?</SelectionTitle>
      <ButtonGroup>
        <SelectionButton onClick={() => handleModeSelection('general')}>
          General Paper Overview
        </SelectionButton>
        <SelectionButton onClick={() => handleModeSelection('deep-dive')}>
          Paper Deep Dive
        </SelectionButton>
      </ButtonGroup>
    </SelectionContainer>
  );

  const PaperInputInterface = () => {
    // const [selectedPaper, setSelectedPaper] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedPaper.trim()) {
        setSelectedPaper(selectedPaper.trim());
        setShowPaperInput(false);
        initializeChat('deep-dive');
      }
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
    };
  
    return (
      <PaperInputContainer>
        <PaperInputForm onSubmit={handleSubmit}>
          <PaperInput
            type="text"
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter paper title or DOI..."
          />
          <SelectionButton type="submit">
            Start Deep Dive
          </SelectionButton>
        </PaperInputForm>
      </PaperInputContainer>
    );
  };

  const TopBannerInterface = () => (
    <TopBanner>
      <BannerContent>
        <BannerText>
          {searchMode === 'general' ? 'Exploring General Papers' : `Deep Dive: ${selectedPaper}`}
        </BannerText>
        <BannerButtons>
          <BannerButton
            active={searchMode === 'general'}
            onClick={() => handleModeSelection('general')}
          >
            General
          </BannerButton>
          <BannerButton
            active={searchMode === 'deep-dive'}
            onClick={() => handleModeSelection('deep-dive')}
          >
            Deep Dive
          </BannerButton>
        </BannerButtons>
      </BannerContent>
    </TopBanner>
  );


  const handleModeSelection = (mode: SearchMode) => {
    setSearchMode(mode);
    if (mode === 'deep-dive') {
      setShowPaperInput(true);
    } else if (mode === 'general') {
      initializeChat('general');
    }
  };

  const handlePaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaper.trim()) {
      setShowPaperInput(false);
      initializeChat('deep-dive');
    }
  };

  const initializeChat = (mode: 'general' | 'deep-dive') => {
    const initialMessage = mode === 'general'
      ? `Hello! You wanted to learn about ${topic.name.toLowerCase()} papers in general - how can I help?`
      : `Hello! You wanted to do a deep dive into the paper "${selectedPaper}" - what would you like to know?`;

    setMessages([{
      id: Date.now().toString(),
      text: initialMessage,
      sender: 'assistant',
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/${topic_name}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsLoading(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [topic_name]);

  if (socketRef.current !== null && socketRef.current?.readyState === WebSocket.OPEN) {
    socketRef.current.onmessage = async (event: MessageEvent) => {
      try {
        const chunk = event.data instanceof Blob ? await event.data.text() : event.data;
        if (chunk === 'END_SEQUENCE') {
          console.log(streamingMessage)
          // Add streaming message to main messages array if it exists
          if (streamingMessage) {
            console.log('Should have gotten the end message and set the messages properly')
            setMessages(prev => [...prev, streamingMessage]);
            setStreamingMessage(null);
          }
          setIsLoading(false);
          return;
        }
        console.log(messages)
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
      console.log('WebSocket closed');
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
    console.log(`original messages: ${JSON.stringify(messages)}`)
    console.log(`temp messages: ${JSON.stringify(temp_messages)}`)

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

  // Render logic
  if (!searchMode) {
    return <SelectionInterface />;
  }

  if (showPaperInput) {
    return <PaperInputInterface />;
  }

  return (
    <Container>
      <TopBannerInterface />
      <MessagesArea>
        {displayMessages.map((message) => (
          <MessageRow key={message.id} isUser={message.sender === 'user'}>
            <MessageBubble isUser={message.sender === 'user'}>
              <MessageText>{message.text}</MessageText>
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