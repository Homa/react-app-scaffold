import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { sendMessage, setModel, newChat, switchConversation, deleteConversation } from '../store/features/chatSlice';
import { useTranslation } from 'react-i18next';

const ChatInterface = () => {
  const { t } = useTranslation();
  const { conversations, activeConversationId, loading, error, model } = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();
  
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the active conversation
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(sendMessage({ content: input, model }));
      setInput(''); // Clear the input field
    }
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setModel(e.target.value));
  };
  
  const handleNewChat = () => {
    dispatch(newChat());
  };
  
  const handleSwitchConversation = (id: string) => {
    dispatch(switchConversation(id));
  };
  
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the switchConversation
    dispatch(deleteConversation(id));
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="chat-app">
      {/* Sidebar for conversations */}
      <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" onClick={handleNewChat}>
            {t('app.newChat')}
          </button>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {showSidebar ? '←' : '→'}
          </button>
        </div>
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
              onClick={() => handleSwitchConversation(conv.id)}
            >
              <span className="conversation-title">{conv.title}</span>
              <button 
                className="delete-conversation" 
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                title={t('app.deleteConversation')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="chat-container">
        <div className="chat-controls">
          <button className="toggle-sidebar-mobile" onClick={toggleSidebar}>
            ☰
          </button>
          <select value={model} onChange={handleModelChange} className="model-selector">
            <option value="llama3">Llama 3</option>
            <option value="mistral">Mistral</option>
            <option value="gemma">Gemma</option>
            <option value="phi3">Phi-3</option>
          </select>
          <button onClick={handleNewChat} className="new-chat-button-mobile">
            {t('app.newChat')}
          </button>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>{t('app.emptyChat')}</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant-message loading">
              <div className="message-content">
                {t('app.thinking')}
              </div>
            </div>
          )}
          {error && (
            <div className="error-message">
              {t('app.error', { message: error })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('app.messagePlaceholder')}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? t('app.sending') : t('app.send')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 