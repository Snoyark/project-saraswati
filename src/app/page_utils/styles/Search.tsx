import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafb;
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MessageRow = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

export const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: ${props => props.isUser ? '#3b82f6' : '#ffffff'};
  color: ${props => props.isUser ? '#ffffff' : '#000000'};
  border: ${props => props.isUser ? 'none' : '1px solid #e5e7eb'};
`;

export const MessageText = styled.p`
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

export const TimeStamp = styled.p`
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.25rem;
  opacity: 0.7;
`;

export const InputArea = styled.div`
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  color: #000000;
  padding: 1rem;
`;

export const Form = styled.form`
  display: flex;
  gap: 1rem;
`;

export const TextArea = styled.textarea`
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

export const SendButton = styled.button<{ disabled: boolean }>`
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

export const LoadingMessage = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #6b7280;
`;

export const SendIcon = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
`;