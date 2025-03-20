import React from 'react'
import ChatInterface from './components/ChatInterface'
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation()

  // Set default language to English on component mount
  React.useEffect(() => {
    i18n.changeLanguage('en');
  }, []);


  return (
    <div className="App">
      <header>
        <h1>{t('app.title')}</h1>
      </header>
      <ChatInterface />
    </div>
  )
}

export default App 