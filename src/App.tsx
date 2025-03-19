import React from 'react'
import TodoList from './components/TodoList'
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="App">
      <header>
        <h1>{t('app.title')}</h1>
        <div className="language-switcher">
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('es')}>Español</button>
        </div>
      </header>
      <TodoList />
    </div>
  )
}

export default App 