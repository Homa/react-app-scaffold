import axios from 'axios'
import { User } from '../types'
import { SendMessageResponse } from '../types'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
})

export const getUsers = () => api.get<User[]>('/users').then(res => res.data)

// API configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_API_KEY = process.env.VITE_MISTRAL_API_KEY || ''

// Create axios instance for Mistral API
const mistralApi = axios.create({
  baseURL: MISTRAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MISTRAL_API_KEY}`
  }
})

// Interface for Mistral API request
interface MistralMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface MistralApiRequest {
  model: string
  messages: MistralMessage[]
  temperature?: number
  max_tokens?: number
}

// Interface for Mistral API response
interface MistralApiResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Function to send message to Mistral API
export const sendMessageToMistral = async (
  content: string, 
  model: string,
  previousMessages: MistralMessage[] = []
): Promise<SendMessageResponse> => {
  try {
    // Determine which Mistral model to use based on the selected model
    let mistralModel = 'mistral-tiny'
    
    switch(model) {
      case 'mistral-medium':
        mistralModel = 'mistral-medium'
        break
      case 'mistral-small':
        mistralModel = 'mistral-small'
        break
      case 'mistral-large':
        mistralModel = 'mistral-large-latest'
        break
      default:
        mistralModel = 'mistral-tiny'
    }
    
    // Prepare messages for the API
    const messages: MistralMessage[] = [
      ...previousMessages,
      { role: 'user', content }
    ]
    
    // Prepare request body
    const requestBody: MistralApiRequest = {
      model: mistralModel,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    }
    
    // Send request to Mistral API
    const response = await mistralApi.post('', requestBody)
    const data = response.data as MistralApiResponse
    
    // Extract assistant's response
    const assistantMessage = data.choices[0].message
    
    // Return formatted response
    return {
      id: data.id,
      content: assistantMessage.content,
      role: 'assistant',
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error)
    throw new Error('Failed to get response from Mistral API')
  }
}

// Mock API for fallback or testing
export const sendMessageToMockApi = async (content: string, model: string): Promise<SendMessageResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate API response
  return {
    id: generateId(),
    content: `Response to: "${content}" using model: ${model}`,
    role: 'assistant',
    timestamp: Date.now()
  }
}

// Simple UUID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 