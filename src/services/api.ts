import axios from 'axios'
import { User } from '../types'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
})

export const getUsers = () => api.get<User[]>('/users').then(res => res.data) 