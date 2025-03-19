import axios from 'axios'
import { Todo, User } from '../types'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
})

export const getTodos = () => api.get<Todo[]>('/todos').then(res => res.data)
export const getUsers = () => api.get<User[]>('/users').then(res => res.data) 