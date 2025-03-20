import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, SendMessageRequest, SendMessageResponse, Message } from '../../types';
import { sendMessageToMistral, sendMessageToMockApi } from '../../services/api';

// Simple UUID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Async thunk for sending a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, model }: SendMessageRequest, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      const { conversations, activeConversationId, memoryLimit } = state.chat;
      
      // Get active conversation
      const conversation = conversations.find(conv => conv.id === activeConversationId);
      
      // Prepare previous messages for context
      const previousMessages = conversation ? 
        conversation.messages
          .slice(-memoryLimit * 2) // Apply memory limit
          .map(msg => ({
            role: msg.role,
            content: msg.content
          })) : 
        [];
      
      // Determine which API to use based on model
      let response: SendMessageResponse;
      
      if (model.startsWith('mistral')) {
        // Use Mistral API
        response = await sendMessageToMistral(content, model, previousMessages);
      } else {
        // Use mock API for other models
        response = await sendMessageToMockApi(content, model);
      }
      
      return { userMessage: content, assistantMessage: response };
    } catch (error) {
      return rejectWithValue('Failed to send message. Please try again.');
    }
  }
);

// Initial state
const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  loading: false,
  error: null,
  model: 'mistral-tiny',
  memoryLimit: 10
};

// Create slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set the active model
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    
    // Create a new chat
    newChat: (state) => {
      const id = generateId();
      const now = Date.now();
      
      state.conversations.unshift({
        id,
        title: 'New Conversation',
        messages: [],
        createdAt: now,
        updatedAt: now
      });
      
      state.activeConversationId = id;
    },
    
    // Switch to a different conversation
    switchConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    
    // Delete a conversation
    deleteConversation: (state, action: PayloadAction<string>) => {
      const index = state.conversations.findIndex(conv => conv.id === action.payload);
      
      if (index !== -1) {
        state.conversations.splice(index, 1);
        
        // If we deleted the active conversation, set a new active one
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = state.conversations.length > 0 ? state.conversations[0].id : null;
        }
      }
    },
    
    // Set memory limit
    setMemoryLimit: (state, action: PayloadAction<number>) => {
      state.memoryLimit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle successful message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { userMessage, assistantMessage } = action.payload;
        
        // If no active conversation, create one
        if (!state.activeConversationId) {
          const id = generateId();
          const now = Date.now();
          
          state.conversations.unshift({
            id,
            title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
            messages: [],
            createdAt: now,
            updatedAt: now
          });
          
          state.activeConversationId = id;
        }
        
        // Find the active conversation
        const conversation = state.conversations.find(conv => conv.id === state.activeConversationId);
        
        if (conversation) {
          // Add user message
          conversation.messages.push({
            id: generateId(),
            content: userMessage,
            role: 'user',
            timestamp: Date.now() - 1000 // Slightly earlier than assistant message
          });
          
          // Add assistant message
          conversation.messages.push({
            id: assistantMessage.id,
            content: assistantMessage.content,
            role: assistantMessage.role,
            timestamp: assistantMessage.timestamp
          });
          
          // Update conversation title if it's the first message
          if (conversation.messages.length === 2) {
            conversation.title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
          }
          
          // Update timestamp
          conversation.updatedAt = Date.now();
          
          // Apply memory limit if needed
          if (state.memoryLimit > 0 && conversation.messages.length > state.memoryLimit * 2) {
            // Keep the most recent messages within the limit (pairs of user/assistant messages)
            conversation.messages = conversation.messages.slice(-state.memoryLimit * 2);
          }
        }
        
        state.loading = false;
      })
      // Handle error
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unknown error occurred';
      });
  }
});

// Export actions and reducer
export const { setModel, newChat, switchConversation, deleteConversation, setMemoryLimit } = chatSlice.actions;
export default chatSlice.reducer; 