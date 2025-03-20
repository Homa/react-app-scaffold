import React from 'react'
import ChatInterface from './components/ChatInterface'
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation()

  // Set default language to English on component mount
  React.useEffect(() => {
    i18n.changeLanguage('en');
  }, []);

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
          <button onClick={() => changeLanguage('ja')}>日本語</button>
          <button onClick={() => changeLanguage('kr')}>한국어</button>
        </div>
      </header>
      <ChatInterface />
    </div>
  )
}

export default App 