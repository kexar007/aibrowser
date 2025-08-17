import React, { useState } from 'react';
import { 
  X, Check, Loader, Database, RefreshCw, Plus, Trash2, 
  AlertCircle, ExternalLink, Zap, Brain, Globe
} from 'lucide-react';

const SettingsPanel = ({ llmProvider, darkMode, onClose }) => {
  const [newCustomModel, setNewCustomModel] = useState('');

  const presetProviders = {
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      defaultModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      description: 'Most popular and reliable AI models'
    },
    anthropic: {
      name: 'Anthropic Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModels: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      description: 'Advanced reasoning and analysis'
    },
    ollama: {
      name: 'Ollama (Local)',
      baseUrl: 'http://localhost:11434/v1',
      defaultModels: ['llama2', 'mistral', 'codellama'],
      description: 'Run models locally on your machine'
    },
    groq: {
      name: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModels: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
      description: 'Ultra-fast inference speeds'
    },
    deepseek: {
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      defaultModels: ['deepseek-chat', 'deepseek-coder'],
      description: 'Advanced coding and general AI models'
    },
    custom: {
      name: 'Custom API',
      baseUrl: '',
      defaultModels: [],
      description: 'Connect to any OpenAI-compatible API'
    }
  };

  const addCustomModel = () => {
    if (newCustomModel.trim() && (!llmProvider.customModels || !llmProvider.customModels.includes(newCustomModel.trim()))) {
      const currentCustomModels = llmProvider.customModels || [];
      llmProvider.setCustomModels([...currentCustomModels, newCustomModel.trim()]);
      setNewCustomModel('');
    }
  };

  const removeCustomModel = (model) => {
    if (llmProvider.customModels) {
      llmProvider.setCustomModels(llmProvider.customModels.filter(m => m !== model));
    }
    if (llmProvider.apiSettings.customModel === model) {
      llmProvider.setApiSettings(prev => ({ 
        ...prev, 
        customModel: '', 
        useCustomModel: false 
      }));
    }
  };

  return (
    <div className={`${
      darkMode ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-xl' 
               : 'bg-white/95 border-gray-200/50 backdrop-blur-xl'
    } border-b px-6 py-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              API Configuration
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure your AI provider to start intelligent web research
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                       : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Provider Selection */}
          <div className="xl:col-span-1">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Choose Provider
            </h3>
            <div className="space-y-3">
              {Object.entries(presetProviders).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => {
                    llmProvider.setApiSettings(prev => ({ 
                      ...prev, 
                      baseUrl: provider.baseUrl 
                    }));
                    llmProvider.setAvailableModels(provider.defaultModels);
                    llmProvider.setApiTested(false);
                    llmProvider.setTestResult(null);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                    llmProvider.apiSettings.baseUrl === provider.baseUrl
                      ? darkMode 
                        ? 'bg-blue-900/30 border-blue-600 ring-2 ring-blue-500/50' 
                        : 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : darkMode 
                        ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      key === 'openai' ? 'bg-green-100 text-green-600' :
                      key === 'anthropic' ? 'bg-purple-100 text-purple-600' :
                      key === 'ollama' ? 'bg-orange-100 text-orange-600' :
                      key === 'groq' ? 'bg-red-100 text-red-600' :
                      key === 'deepseek' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {key === 'ollama' ? <Globe className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {provider.name}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="xl:col-span-2 space-y-6">
            {/* API Settings */}
            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                API Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    API Base URL
                  </label>
                  <input
                    type="url"
                    value={llmProvider.apiSettings.baseUrl}
                    onChange={(e) => {
                      llmProvider.setApiSettings(prev => ({ ...prev, baseUrl: e.target.value }));
                      llmProvider.setApiTested(false);
                      llmProvider.setTestResult(null);
                    }}
                    placeholder="https://api.openai.com/v1"
                    className={`w-full p-3 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                               : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={llmProvider.apiSettings.apiKey}
                    onChange={(e) => {
                      llmProvider.setApiSettings(prev => ({ ...prev, apiKey: e.target.value }));
                      llmProvider.setApiTested(false);
                      llmProvider.setTestResult(null);
                    }}
                    placeholder="Enter your API key"
                    className={`w-full p-3 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                               : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Test API Button */}
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={llmProvider.testAPI}
                  disabled={!llmProvider.apiSettings.apiKey || !llmProvider.apiSettings.baseUrl || 
                           (llmProvider.testResult && llmProvider.testResult.testing)}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {llmProvider.testResult && llmProvider.testResult.testing ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Test Connection</span>
                </button>
                
                <button
                  onClick={llmProvider.fetchAvailableModels}
                  disabled={!llmProvider.isConnected || llmProvider.fetchingModels}
                  className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {llmProvider.fetchingModels ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Fetch Models</span>
                </button>
              </div>

              {/* Test Result */}
              {llmProvider.testResult && !llmProvider.testResult.testing && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  llmProvider.testResult.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {llmProvider.testResult.success ? 
                    <Check className="w-4 h-4" /> : 
                    <AlertCircle className="w-4 h-4" />
                  }
                  <span className="text-sm">{llmProvider.testResult.message}</span>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Model Selection
              </h3>
              
              <div className="space-y-4">
                {/* Available Models */}
                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="radio"
                      checked={!llmProvider.apiSettings.useCustomModel}
                      onChange={() => llmProvider.setApiSettings(prev => ({ 
                        ...prev, 
                        useCustomModel: false 
                      }))}
                      className="text-blue-500"
                    />
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Use available model
                    </span>
                  </label>
                  
                  {!llmProvider.apiSettings.useCustomModel && (
                    <select
                      value={llmProvider.apiSettings.model}
                      onChange={(e) => llmProvider.setApiSettings(prev => ({ 
                        ...prev, 
                        model: e.target.value 
                      }))}
                      className={`w-full p-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' 
                                 : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      {llmProvider.availableModels && llmProvider.availableModels.length > 0 ? (
                        llmProvider.availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))
                      ) : (
                        <option value="">No models available - fetch models first</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Custom Model */}
                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="radio"
                      checked={llmProvider.apiSettings.useCustomModel}
                      onChange={() => llmProvider.setApiSettings(prev => ({ 
                        ...prev, 
                        useCustomModel: true 
                      }))}
                      className="text-blue-500"
                    />
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Use custom model
                    </span>
                  </label>
                  
                  {llmProvider.apiSettings.useCustomModel && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={llmProvider.apiSettings.customModel}
                        onChange={(e) => llmProvider.setApiSettings(prev => ({ 
                          ...prev, 
                          customModel: e.target.value 
                        }))}
                        placeholder="Enter custom model name (e.g., deepseek-chat)"
                        className={`w-full p-3 border rounded-lg ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                   : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                      
                      {/* Custom Models Management */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCustomModel}
                            onChange={(e) => setNewCustomModel(e.target.value)}
                            placeholder="Add model to quick list"
                            className={`flex-1 p-2 text-sm border rounded ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                       : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                            }`}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomModel()}
                          />
                          <button
                            onClick={addCustomModel}
                            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {llmProvider.customModels && llmProvider.customModels.length > 0 && (
                          <div className="space-y-1">
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Quick select:
                            </p>
                            {llmProvider.customModels && llmProvider.customModels.map((model, index) => (
                              <div key={index} className={`flex items-center justify-between p-2 rounded ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}>
                                <button
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                  onClick={() => llmProvider.setApiSettings(prev => ({ 
                                    ...prev, 
                                    customModel: model 
                                  }))}
                                >
                                  {model}
                                </button>
                                <button
                                  onClick={() => removeCustomModel(model)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Advanced Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={llmProvider.apiSettings.maxTokens}
                    onChange={(e) => llmProvider.setApiSettings(prev => ({ 
                      ...prev, 
                      maxTokens: parseInt(e.target.value) 
                    }))}
                    min="1"
                    max="32000"
                    className={`w-full p-3 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' 
                               : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Temperature
                  </label>
                  <input
                    type="number"
                    value={llmProvider.apiSettings.temperature}
                    onChange={(e) => llmProvider.setApiSettings(prev => ({ 
                      ...prev, 
                      temperature: parseFloat(e.target.value) 
                    }))}
                    min="0"
                    max="2"
                    step="0.1"
                    className={`w-full p-3 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' 
                               : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;