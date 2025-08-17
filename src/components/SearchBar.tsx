import React from 'react';
import { Search, Send, Loader, Mic, MicOff, Sparkles } from 'lucide-react';

const SearchBar = ({ 
  query, 
  setQuery, 
  onSearch, 
  loading, 
  darkMode, 
  voiceInput, 
  onVoiceInput, 
  isConnected 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className={`relative ${
      darkMode ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' 
               : 'bg-white/80 backdrop-blur-xl border-gray-200/50'
    } rounded-2xl shadow-2xl border transition-all duration-300 hover:shadow-3xl ${
      loading ? 'ring-2 ring-blue-500/50' : ''
    }`}>
      <div className="flex items-center p-6">
        {/* Search Icon */}
        <div className={`mr-4 p-2 rounded-lg ${
          darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <Search className="w-6 h-6" />
        </div>

        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... I'll search the web and provide comprehensive insights"
            className={`w-full text-lg resize-none overflow-hidden ${
              darkMode ? 'bg-transparent text-white placeholder-gray-400' 
                       : 'bg-transparent text-gray-800 placeholder-gray-500'
            } outline-none min-h-[28px] max-h-32`}
            disabled={loading}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '28px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          
          {/* Character count for long queries */}
          {query.length > 100 && (
            <div className={`absolute -bottom-6 right-0 text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {query.length} characters
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Voice Input Button */}
          {voiceInput.isSupported && (
            <button
              onClick={onVoiceInput}
              className={`p-3 rounded-xl transition-all duration-200 ${
                voiceInput.isListening 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } hover:scale-105`}
              title={voiceInput.isListening ? 'Stop listening' : 'Start voice input'}
              disabled={loading}
            >
              {voiceInput.isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={onSearch}
            disabled={loading || !query.trim() || !isConnected}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              loading || !query.trim() || !isConnected
                ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
            }`}
            title={
              !isConnected 
                ? 'Please configure API connection first' 
                : !query.trim() 
                  ? 'Enter a query to search'
                  : 'Search with AI'
            }
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voice Input Indicator */}
      {voiceInput.isListening && (
        <div className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg ${
          darkMode ? 'bg-red-900/80 text-red-300' : 'bg-red-100 text-red-700'
        } text-sm flex items-center space-x-2`}>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Listening... Speak now</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;