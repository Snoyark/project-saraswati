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

// New styled components for the selection interface
export const SelectionContainer = styled.div`
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

export const SelectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

export const SelectionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
`;

export const PaperInputContainer = styled.div`
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

export const PaperInputForm = styled.form`
  display: flex;
  gap: 1rem;
`;

export const PaperInput = styled.input`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #000000;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

export const TopBanner = styled.div`
  padding: 1rem;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
`;

export const BannerContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BannerText = styled.span`
  font-weight: 500;
  color: #374151;
`;

export const BannerButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const BannerButton = styled.button<{ active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.active ? '#ffffff' : '#374151'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#d1d5db'};
  }
`;

// Date picker styled components
export const DatePickerContainer = styled.div`
  margin-top: 0.5rem;
`;

export const DatePickerLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

export const DatePickerInput = styled.input`
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;