export interface User {
  id: number
  name: string
  email: string
}

// Message types
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

// Conversation types
export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

// Chat state types
export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  loading: boolean
  error: string | null
  model: string
  memoryLimit: number
}

// History types
export interface HistoryGroup {
  title: string
  conversations: Conversation[]
}

export interface GroupedConversations {
  today: Conversation[]
  yesterday: Conversation[]
  older: Conversation[]
}

// API request/response types
export interface SendMessageRequest {
  content: string
  model: string
}

export interface SendMessageResponse {
  id: string
  content: string
  role: 'assistant'
  timestamp: number
} 