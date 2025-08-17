import React, { useState, useEffect } from 'react';
import type { WebScraper, LLMProvider, VoiceInput } from '../hooks/types';
import { 
  Search, Settings, Send, Loader, ExternalLink, Check, X, Moon, Sun, 
  Mic, MicOff, Download, Share2, ChevronDown, ChevronUp, Globe, Brain, 
  Database, RefreshCw, Plus, Trash2, Edit3, AlertCircle, Zap, Eye,
  BookOpen, TrendingUp, Clock, Star
} from 'lucide-react';
import SearchBar from './SearchBar';
import SettingsPanel from './SettingsPanel';
import ResultsView from './ResultsView';
import LoadingIndicator from './LoadingIndicator';
import { useWebScraper } from '../hooks/useWebScraper';
import { useLLMProvider } from '../hooks/useLLMProvider';
import { useVoiceInput } from '../hooks/useVoiceInput';

const AIAgenticBrowser = () => {
  console.log('AIAgenticBrowser component mounting');
  const [query, setQuery] = useState('');
  console.log('Initial query state:', query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Custom hooks for modular functionality
  const webScraper = useWebScraper();
  const llmProvider = useLLMProvider();
  const voiceInput = useVoiceInput();

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Example queries for inspiration
  const exampleQueries = [
    "Latest developments in AI technology",
    "Climate change solutions 2024",
    "Best programming languages to learn",
    "Cryptocurrency market trends",
    "Space exploration recent news",
    "Renewable energy breakthroughs"
  ];

  // Main search function
  const handleSearch = async () => {
    console.log('Initiating search for query:', query);
    if (!query.trim()) return;
    if (!llmProvider.isConnected) {
      llmProvider.setTestResult({ 
        success: false, 
        message: 'Please configure and test your API connection first' 
      });
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Step 1: Web scraping
      const webData = await webScraper.scrapeQuery(query);
      
      // Step 2: LLM processing with enhanced prompt
      const llmResponse = await llmProvider.processWithLLM(query, webData.sources);
      
      // Step 3: Compile results
      const finalResults = {
        query,
        answer: llmResponse.answer,
        confidence: llmResponse.confidence,
        sources: webData.sources,
        sourcesUsed: llmResponse.sources_used || [],
        modelUsed: llmProvider.getCurrentModel(),
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now(), // Would be calculated properly
        searchResultsCount: webData.sources.length
      };

      console.log('Search completed successfully', finalResults);
      setResults(finalResults);
    } catch (error) {
      console.error('Search error:', error);
      console.log('Error details:', {
        query,
        error: error.message,
        stack: error.stack
      });
      setResults({
        error: `Failed to process your query: ${error.message}`,
        timestamp: new Date().toISOString(),
        query
      });
    } finally {
      setLoading(false);
    }
  };

  // Voice input integration
  const handleVoiceInput = () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
    } else {
      voiceInput.startListening((transcript: string) => {
        setQuery(transcript);
      });
    }
  };

  // Utility functions
  const clearResults = () => {
    setResults(null);
    setQuery('');
  };

  const handleExampleQuery = (example: string) => {
    setQuery(example);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
               : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Enhanced Header */}
      <header className={`${
        darkMode ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-xl' 
                 : 'bg-white/80 border-gray-200/50 backdrop-blur-xl'
      } border-b px-6 py-4 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                       : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            } shadow-lg`}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                AI Agentic Browser
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Intelligent web research powered by AI
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
                llmProvider.isConnected 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  llmProvider.isConnected ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <span>{llmProvider.isConnected ? 'Connected' : 'Not Connected'}</span>
              </div>
              {llmProvider.isConnected && (
                <div className={`px-2 py-1 rounded text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {llmProvider.getCurrentModel()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {results && (
              <button
                onClick={clearResults}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                           : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Clear results"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                         : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                         : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } ${showSettings ? 'ring-2 ring-blue-500' : ''}`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel 
          llmProvider={llmProvider}
          darkMode={darkMode}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
            darkMode={darkMode}
            voiceInput={voiceInput}
            onVoiceInput={handleVoiceInput}
            isConnected={llmProvider.isConnected}
          />
          
          {/* Connection Warning */}
          {!llmProvider.isConnected && (
            <div className={`mt-4 p-4 rounded-xl border ${
              darkMode ? 'bg-orange-900/20 border-orange-800/50 text-orange-400' 
                       : 'bg-orange-50 border-orange-200 text-orange-700'
            } flex items-center space-x-3`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">API Configuration Required</p>
                <p className="text-sm opacity-90">
                  Please configure and test your API connection in settings before searching.
                </p>
              </div>
            </div>
          )}

          {/* API Test Result */}
          {llmProvider.testResult && !llmProvider.testResult.testing && (
            <div className={`mt-4 p-4 rounded-xl border flex items-center space-x-3 ${
              llmProvider.testResult.success 
                ? darkMode ? 'bg-green-900/20 border-green-800/50 text-green-400' 
                           : 'bg-green-50 border-green-200 text-green-700'
                : darkMode ? 'bg-red-900/20 border-red-800/50 text-red-400' 
                           : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {llmProvider.testResult.success ? 
                <Check className="w-5 h-5 flex-shrink-0" /> : 
                <X className="w-5 h-5 flex-shrink-0" />
              }
              <span className="text-sm">{llmProvider.testResult.message}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <LoadingIndicator darkMode={darkMode} query={query} />}

        {/* Results */}
        {results && !loading && (
          <ResultsView 
            results={results} 
            darkMode={darkMode}
            onClear={clearResults}
          />
        )}

        {/* Welcome State */}
        {!results && !loading && (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className={`inline-flex p-6 rounded-2xl mb-6 ${
                darkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20' 
                         : 'bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-200'
              }`}>
                <Brain className={`w-16 h-16 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Intelligent Web Research
              </h2>
              <p className={`text-lg mb-8 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Ask any question and get comprehensive answers powered by real-time web research and AI analysis
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Lightning Fast",
                  description: "Get instant answers with real-time web scraping and AI processing"
                },
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "Live Web Data",
                  description: "Access the latest information from across the internet"
                },
                {
                  icon: <Brain className="w-6 h-6" />,
                  title: "AI-Powered Analysis",
                  description: "Advanced reasoning and synthesis of multiple sources"
                },
                {
                  icon: <Eye className="w-6 h-6" />,
                  title: "Source Transparency",
                  description: "See exactly where information comes from with full citations"
                },
                {
                  icon: <Settings className="w-6 h-6" />,
                  title: "Flexible APIs",
                  description: "Works with OpenAI, Anthropic, local models, and more"
                },
                {
                  icon: <BookOpen className="w-6 h-6" />,
                  title: "Rich Formatting",
                  description: "Beautiful, readable responses with proper structure"
                }
              ].map((feature, index) => (
                <div key={index} className={`p-6 rounded-xl border transition-all duration-200 hover:scale-105 ${
                  darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                           : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}>
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${
                    darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Example Queries */}
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Try asking about:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuery(example)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
                      darkMode ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                               : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
                    }`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Getting Started */}
            {!llmProvider.isConnected && (
              <div className={`mt-12 p-6 rounded-xl border ${
                darkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-blue-400' : 'text-blue-800'
                }`}>
                  🚀 Getting Started
                </h3>
                <div className="space-y-3">
                  {[
                    "Click the Settings button in the top right",
                    "Choose your preferred AI provider (OpenAI, Anthropic, etc.)",
                    "Enter your API key and test the connection",
                    "Start asking questions and get intelligent answers!"
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className={`${
        darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
      } border-t px-6 py-6 mt-16 backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI Agentic Browser - Intelligent web research made simple
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <Database className={`w-4 h-4 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {llmProvider.apiSettings.baseUrl || 'No API configured'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Brain className={`w-4 h-4 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {llmProvider.getCurrentModel() || 'No model selected'}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 ${
                llmProvider.isConnected ? 'text-green-500' : 'text-orange-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  llmProvider.isConnected ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <span>{llmProvider.isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIAgenticBrowser;