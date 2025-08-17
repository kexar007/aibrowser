import React from 'react';
import { Globe, Database, Brain, Search, Zap, TrendingUp } from 'lucide-react';

const LoadingIndicator = ({ darkMode, query }) => {
  const steps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Analyzing Query",
      description: "Understanding your search intent and requirements"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Web Research",
      description: "Searching and accessing relevant web sources"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Content Extraction",
      description: "Extracting and processing information from sources"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Analysis",
      description: "Synthesizing insights with advanced reasoning"
    }
  ];

  return (
    <div className={`max-w-4xl mx-auto ${
      darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'
    } rounded-2xl shadow-xl border backdrop-blur-sm p-8`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex p-4 rounded-xl mb-4 ${
          darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <div className="relative">
            <Brain className="w-8 h-8" />
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Processing Your Request
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Searching the web and analyzing results with AI
        </p>
      </div>

      {/* Query Display */}
      <div className={`p-4 rounded-lg mb-8 ${
        darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            darkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Your Query:
            </p>
            <p className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>
              "{query}"
            </p>
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            {/* Step Icon */}
            <div className={`flex-shrink-0 p-3 rounded-lg ${
              darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {step.icon}
            </div>
            
            {/* Step Content */}
            <div className="flex-1">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {step.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>
            
            {/* Loading Animation */}
            <div className="flex-shrink-0">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                }`} style={{animationDelay: '0ms'}}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                }`} style={{animationDelay: '150ms'}}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                }`} style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className={`w-full h-2 rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div className={`h-2 rounded-full ${
            darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                     : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          } animate-pulse`} style={{width: '60%'}}></div>
        </div>
        <p className={`text-xs mt-2 text-center ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          This may take a few moments...
        </p>
      </div>

      {/* Fun Facts */}
      <div className={`mt-8 p-4 rounded-lg ${
        darkMode ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
                 : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className={`w-4 h-4 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`} />
          <span className={`text-sm font-medium ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Did you know?
          </span>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          AI can process and analyze thousands of web pages in seconds to give you comprehensive, 
          up-to-date information on any topic.
        </p>
      </div>
    </div>
  );
};

export default LoadingIndicator;