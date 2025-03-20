import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { sendMessage, setModel, newChat, switchConversation, deleteConversation, setMemoryLimit } from '../store/features/chatSlice';
import { useTranslation } from 'react-i18next';
import { GroupedConversations, Conversation } from '../types';

const ChatInterface = () => {
  const { t } = useTranslation();
  const { 
    conversations, 
    activeConversationId, 
    loading, 
    error, 
    model,
    memoryLimit 
  } = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();
  
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    setHistoryOpen(false);
  };
  
  const handleSwitchConversation = (id: string) => {
    dispatch(switchConversation(id));
    setHistoryOpen(false);
  };
  
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the switchConversation
    dispatch(deleteConversation(id));
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const handleMemoryLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMemoryLimit(Number(e.target.value)));
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleChatVisibility = () => {
    setChatVisible(!chatVisible);
  };

  const toggleHistory = () => {
    setHistoryOpen(!historyOpen);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group conversations by date
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000; // 24 hours in milliseconds

  const groupedConversations: GroupedConversations = {
    today: [],
    yesterday: [],
    older: []
  };

  // Group conversations by date
  filteredConversations.forEach(conv => {
    const firstMessage = conv.messages[0];
    if (!firstMessage) {
      groupedConversations.today.push(conv);
      return;
    }

    const timestamp = firstMessage.timestamp;
    const date = new Date(timestamp).setHours(0, 0, 0, 0);

    if (date === today) {
      groupedConversations.today.push(conv);
    } else if (date === yesterday) {
      groupedConversations.yesterday.push(conv);
    } else {
      groupedConversations.older.push(conv);
    }
  });

  // Render conversation group
  const renderConversationGroup = (title: string, conversations: Conversation[]) => {
    if (conversations.length === 0) return null;
    
    return (
      <div className="history-group">
        <h4 className="history-group-title">{title}</h4>
        {conversations.map(conv => (
          <div 
            key={conv.id} 
            className={`history-item ${conv.id === activeConversationId ? 'active' : ''}`}
            onClick={() => handleSwitchConversation(conv.id)}
          >
            <span className="history-item-title">{conv.title}</span>
            <button 
              className="delete-history-item" 
              onClick={(e) => handleDeleteConversation(conv.id, e)}
              title={t('app.deleteConversation')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chat-interface-wrapper">
      {/* Toggle button to show/hide chat */}
      <button 
        className="chat-toggle-button"
        onClick={toggleChatVisibility}
        aria-label={chatVisible ? t('app.hideChat') : t('app.showChat')}
      >
        {chatVisible ? '✕' : '💬'}
      </button>
      
      {/* Main chat app */}
      {chatVisible && (
        <div className="chat-app">
          {/* Chat history sliding panel */}
          <div className={`chat-history-panel ${historyOpen ? 'open' : ''}`}>
            <div className="chat-history-header">
              <h3>{t('app.chatHistory')}</h3>
              <button className="close-history-button" onClick={toggleHistory}>✕</button>
            </div>
            <div className="chat-history-search">
              <input 
                type="text" 
                placeholder={t('app.searchConversations')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="chat-history-content">
              <button className="new-chat-button history-new-chat" onClick={handleNewChat}>
                <span className="plus-icon">+</span> {t('app.newChat')}
              </button>
              
              {renderConversationGroup(t('app.today'), groupedConversations.today)}
              {renderConversationGroup(t('app.yesterday'), groupedConversations.yesterday)}
              {renderConversationGroup(t('app.older'), groupedConversations.older)}
              
              {filteredConversations.length === 0 && (
                <div className="no-history-results">
                  <p>{t('app.noConversationsFound')}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="chat-container">
            <div className="chat-controls">
              <div className="chat-controls-left">
                <button className="history-button" onClick={toggleHistory}>
                  ☰ {t('app.history')}
                </button>
                <button className="new-conversation-button" onClick={handleNewChat}>
                  + {t('app.newConversation')}
                </button>
              </div>
              <div className="chat-controls-right">
                <select value={model} onChange={handleModelChange} className="model-selector">
                  <option value="mistral-tiny">Mistral Tiny</option>
                  <option value="mistral-small">Mistral Small</option>
                  <option value="mistral-medium">Mistral Medium</option>
                  <option value="mistral-large">Mistral Large</option>
                  <option value="llama3">Llama 3</option>
                  <option value="gemma">Gemma</option>
                  <option value="phi3">Phi-3</option>
                </select>
                <button onClick={toggleSettings} className="settings-button">
                  ⚙️
                </button>
              </div>
            </div>
            
            {showSettings && (
              <div className="settings-panel">
                <h3>{t('app.settings')}</h3>
                <div className="setting-item">
                  <label htmlFor="memory-limit">{t('app.memoryLimit')}</label>
                  <select 
                    id="memory-limit" 
                    value={memoryLimit} 
                    onChange={handleMemoryLimitChange}
                    className="memory-selector"
                  >
                    <option value="5">5 {t('app.messages')}</option>
                    <option value="10">10 {t('app.messages')}</option>
                    <option value="20">20 {t('app.messages')}</option>
                    <option value="50">50 {t('app.messages')}</option>
                    <option value="100">100 {t('app.messages')}</option>
                  </select>
                </div>
              </div>
            )}
            
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
      )}
    </div>
  );
};

export default ChatInterface; 