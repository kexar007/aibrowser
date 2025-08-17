import React, { useState } from 'react';
import { 
  Brain, ExternalLink, ChevronDown, ChevronUp, Download, Share2, 
  Clock, TrendingUp, Star, Copy, Check, Eye, Globe, Zap
} from 'lucide-react';

const ResultsView = ({ results, darkMode, onClear }) => {
  const [expandedSources, setExpandedSources] = useState({});
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const toggleSourceExpansion = (index) => {
    setExpandedSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(results.answer);
      setCopiedAnswer(true);
      setTimeout(() => setCopiedAnswer(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportResults = () => {
    const content = `# AI Browser Query Results

## Query: ${results.query}
## Model: ${results.modelUsed}
## Confidence: ${results.confidence}%
## Timestamp: ${new Date(results.timestamp).toLocaleString()}

${results.answer}

## Sources:
${results.sources.map((source, index) => `
### ${index + 1}. ${source.title}
- URL: ${source.url}
- Excerpt: ${source.excerpt}
`).join('')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-browser-results-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    if (!navigator.share) return;
    
    try {
      await navigator.share({
        title: `AI Browser Results: ${results.query}`,
        text: results.answer.substring(0, 200) + '...',
        url: window.location.href
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    
    return text
      .replace(/### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-white">$1</h3>')
      .replace(/## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-white">$1</h2>')
      .replace(/# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-800 dark:text-white">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      .replace(/- (.*$)/gim, '<li class="ml-4 text-gray-700 dark:text-gray-300 mb-1">• $1</li>')
      .replace(/\n/g, '<br>');
  };

  if (results.error) {
    return (
      <div className={`max-w-4xl mx-auto ${
        darkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'
      } border rounded-2xl p-8`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              Search Error
            </h2>
            <p className={`text-sm ${
              darkMode ? 'text-red-300' : 'text-red-500'
            }`}>
              Something went wrong while processing your request
            </p>
          </div>
        </div>
        
        <p className={`${
          darkMode ? 'text-red-300' : 'text-red-700'
        } mb-6`}>
          {results.error}
        </p>
        
        <button
          onClick={onClear}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Query Summary */}
      <div className={`max-w-4xl mx-auto ${
        darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-blue-50/50 border-blue-200/50'
      } border rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Search Query
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(results.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className={`w-4 h-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {results.confidence}% confidence
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {results.sources.length} sources
              </span>
            </div>
          </div>
        </div>
        
        <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          "{results.query}"
        </p>
      </div>

      {/* AI Answer */}
      <div className={`max-w-4xl mx-auto ${
        darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'
      } rounded-2xl shadow-xl border backdrop-blur-sm`}>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                         : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              } shadow-lg`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  AI Analysis & Insights
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Model: {results.modelUsed}
                  </p>
                  <div className={`flex items-center space-x-1 ${
                    results.confidence >= 80 ? 'text-green-500' :
                    results.confidence >= 60 ? 'text-yellow-500' : 'text-orange-500'
                  }`}>
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{results.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={copyAnswer}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                           : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Copy answer"
              >
                {copiedAnswer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={exportResults}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                           : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Export as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
              {navigator.share && (
                <button
                  onClick={shareResults}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                             : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Share results"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div 
            className={`prose prose-lg max-w-none ${
              darkMode ? 'prose-invert' : ''
            } leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(results.answer) }}
          />
        </div>
      </div>

      {/* Sources */}
      <div className={`max-w-4xl mx-auto ${
        darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'
      } rounded-2xl shadow-xl border backdrop-blur-sm`}>
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 rounded-xl ${
              darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <ExternalLink className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Sources & References
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {results.sources.length} web sources analyzed
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {results.sources.map((source, index) => (
              <div key={index} className={`border rounded-xl transition-all duration-200 ${
                darkMode ? 'border-gray-700 bg-gray-700/30 hover:border-gray-600' 
                         : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              } ${results.sourcesUsed && results.sourcesUsed.includes(index) ? 
                'ring-2 ring-blue-500/50 border-blue-500/50' : ''
              }`}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className={`font-semibold text-lg ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {source.title}
                        </h3>
                        {results.sourcesUsed && results.sourcesUsed.includes(index) && (
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            darkMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                     : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            <Zap className="w-3 h-3 inline mr-1" />
                            Used by AI
                          </span>
                        )}
                      </div>
                      
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-sm ${
                          darkMode ? 'text-blue-400 hover:text-blue-300' 
                                   : 'text-blue-600 hover:text-blue-700'
                        } hover:underline flex items-center space-x-1 mb-3`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{source.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {source.excerpt}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => toggleSourceExpansion(index)}
                      className={`ml-4 p-2 rounded-lg transition-colors ${
                        darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                                 : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      }`}
                      title="Toggle full content"
                    >
                      {expandedSources[index] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {expandedSources[index] && (
                    <div className={`mt-6 p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-3 flex items-center space-x-2 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <Eye className="w-4 h-4" />
                        <span>Full Content Extract</span>
                      </h4>
                      <div className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      } whitespace-pre-wrap max-h-64 overflow-y-auto`}>
                        {source.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;