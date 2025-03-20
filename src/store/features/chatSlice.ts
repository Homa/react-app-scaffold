import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
  model: string;
}

// Create a new conversation with a default title
const createNewConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'New Conversation',
  messages: [],
  createdAt: Date.now(),
});

// Initial state with one empty conversation
const initialConversation = createNewConversation();
const initialState: ChatState = {
  conversations: [initialConversation],
  activeConversationId: initialConversation.id,
  loading: false,
  error: null,
  model: 'llama3'
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, model }: { content: string, model: string }, { getState, rejectWithValue }) => {
    try {
      // Add user message to state before sending to API
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      // Call Ollama API
      const response = await axios.post('http://localhost:11434/api/chat', {
        model,
        messages: [{ role: 'user', content }],
        stream: false
      });
      
      // Create assistant message from response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message.content,
        timestamp: Date.now() + 1
      };
      
      // Update conversation title based on first user message
      const isFirstMessage = (getState() as any).chat.conversations.find(
        (c: Conversation) => c.id === (getState() as any).chat.activeConversationId
      ).messages.length === 0;
      
      return { 
        userMessage, 
        assistantMessage,
        updateTitle: isFirstMessage,
        title: content.length > 30 ? content.substring(0, 30) + '...' : content
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    newChat: (state) => {
      const newConversation = createNewConversation();
      state.conversations.push(newConversation);
      state.activeConversationId = newConversation.id;
    },
    switchConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(conv => conv.id !== action.payload);
      // If we deleted the active conversation, switch to the most recent one
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations.length > 0 
          ? state.conversations[state.conversations.length - 1].id 
          : null;
        
        // If we deleted all conversations, create a new one
        if (state.activeConversationId === null) {
          const newConversation = createNewConversation();
          state.conversations.push(newConversation);
          state.activeConversationId = newConversation.id;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Find the active conversation
        const activeConversation = state.conversations.find(
          conv => conv.id === state.activeConversationId
        );
        
        if (activeConversation) {
          // Add messages to the active conversation
          activeConversation.messages.push(action.payload.userMessage);
          activeConversation.messages.push(action.payload.assistantMessage);
          
          // Update conversation title if this is the first message
          if (action.payload.updateTitle) {
            activeConversation.title = action.payload.title;
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setModel, newChat, switchConversation, deleteConversation } = chatSlice.actions;
export default chatSlice.reducer; 