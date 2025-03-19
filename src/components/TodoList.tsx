import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { toggleTodo, addTodo } from '../store/features/todoSlice'
import { useTranslation } from 'react-i18next'

const TodoList = () => {
  const { t } = useTranslation()
  const { todos, loading, error } = useAppSelector(state => state.todos)
  const dispatch = useAppDispatch()
  
  const [newTodo, setNewTodo] = useState('')

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      dispatch(addTodo({ id: Date.now(), title: newTodo, completed: false }))
      setNewTodo('') // Clear the input field
    }
  }

  if (loading) return <div>{t('app.loading')}</div>
  if (error) return <div>{t('app.error', { message: error })}</div>

  return (
    <div>
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder={t('app.addTodoPlaceholder')}
          required
        />
        <button type="submit">{t('app.addTodo')}</button>
      </form>
      {todos.length === 0 ? (
        <p>{t('app.emptyList')}</p>
      ) : (
        <ul>
          {todos.map(todo => (
            <li
              key={todo.id}
              onClick={() => dispatch(toggleTodo(todo.id))}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            >
              {todo.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TodoList; 