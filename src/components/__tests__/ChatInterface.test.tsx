import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatInterface from '../ChatInterface';
import chatReducer from '../../store/features/chatSlice';
import { describe, it, expect, vi } from 'vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      data: { message: { content: 'I am an AI assistant.' } }
    }))
  }
}));

// Helper function to create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      chat: chatReducer
    },
    preloadedState: initialState
  });
};

describe('ChatInterface', () => {
  it('renders empty chat state', () => {
    const store = createTestStore({
      chat: {
        messages: [],
        loading: false,
        error: null,
        model: 'llama3'
      }
    });
    
    render(
      <Provider store={store}>
        <ChatInterface />
      </Provider>
    );
    
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const store = createTestStore({
      chat: {
        messages: [],
        loading: true,
        error: null,
        model: 'llama3'
      }
    });
    
    render(
      <Provider store={store}>
        <ChatInterface />
      </Provider>
    );
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  // Add more tests as needed
}); 