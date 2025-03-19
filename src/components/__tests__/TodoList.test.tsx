import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import TodoList from '../TodoList'
import todoReducer, { addTodo } from '../../store/features/todoSlice'
import { describe, it, expect } from 'vitest'

// Helper function to create a test store with custom state
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      todos: todoReducer
    },
    preloadedState: initialState
  })
}

describe('TodoList', () => {
  it('renders loading state', () => {
    const store = createTestStore({
      todos: {
        todos: [],
        loading: true,
        error: null
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders error message when there is an error', () => {
    const store = createTestStore({
      todos: {
        todos: [],
        loading: false,
        error: 'Failed to fetch todos'
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    expect(screen.getByText('Error: Failed to fetch todos')).toBeInTheDocument()
  })

  it('renders list of todos', () => {
    const store = createTestStore({
      todos: {
        todos: [
          { id: 1, title: 'Learn React', completed: false },
          { id: 2, title: 'Learn Redux', completed: true }
        ],
        loading: false,
        error: null
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    expect(screen.getByText('Learn React')).toBeInTheDocument()
    expect(screen.getByText('Learn Redux')).toBeInTheDocument()
    
    // Check that completed todo has line-through style
    const completedTodo = screen.getByText('Learn Redux')
    expect(completedTodo).toHaveStyle('text-decoration: line-through')
    
    // Check that incomplete todo doesn't have line-through
    const incompleteTodo = screen.getByText('Learn React')
    expect(incompleteTodo).toHaveStyle('text-decoration: none')
  })

  it('adds a new todo when form is submitted', () => {
    const store = createTestStore({
      todos: {
        todos: [],
        loading: false,
        error: null
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    // Fill out the form
    const input = screen.getByPlaceholderText('Add a new todo')
    fireEvent.change(input, { target: { value: 'Test new todo' } })
    
    // Submit the form
    const button = screen.getByText('Add Todo')
    fireEvent.click(button)
    
    // Check that the new todo was added
    expect(screen.getByText('Test new todo')).toBeInTheDocument()
    
    // Check that the input was cleared
    expect(input).toHaveValue('')
  })

  it('toggles todo completion status when clicked', () => {
    const store = createTestStore({
      todos: {
        todos: [
          { id: 1, title: 'Learn React', completed: false }
        ],
        loading: false,
        error: null
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    // Find and click the todo
    const todo = screen.getByText('Learn React')
    fireEvent.click(todo)
    
    // Check that the todo's style has changed to line-through
    expect(todo).toHaveStyle('text-decoration: line-through')
  })

  it('does not add empty todos', () => {
    const store = createTestStore({
      todos: {
        todos: [],
        loading: false,
        error: null
      }
    })
    
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    )
    
    // Try to submit the form with empty input
    const button = screen.getByText('Add Todo')
    fireEvent.click(button)
    
    // Check that no todos were added
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
}) 