import { useState, useEffect } from 'react';

export const useLLMProvider = () => {
  const [apiSettings, setApiSettings] = useState(() => {
    const saved = localStorage.getItem('llmApiSettings');
    return saved ? JSON.parse(saved) : {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      customModel: '',
      useCustomModel: false,
      maxTokens: 4000,
      temperature: 0.7
    };
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [apiTested, setApiTested] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [customModels, setCustomModels] = useState(() => {
    const saved = localStorage.getItem('customModels');
    return saved ? JSON.parse(saved) : [];
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('llmApiSettings', JSON.stringify(apiSettings));
  }, [apiSettings]);

  useEffect(() => {
    localStorage.setItem('customModels', JSON.stringify(customModels));
  }, [customModels]);

  const testAPI = async () => {
    if (!apiSettings.apiKey || !apiSettings.baseUrl) {
      setTestResult({ 
        success: false, 
        message: 'Please provide API key and base URL' 
      });
      return;
    }

    setTestResult({ testing: true });
    
    try {
      const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }

      await response.json();
      
      setTestResult({ 
        success: true, 
        message: 'API connection successful! Ready to process queries.' 
      });
      setApiTested(true);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Connection failed: ${error.message}` 
      });
      setApiTested(false);
    }
  };

  const fetchAvailableModels = async () => {
    if (!apiSettings.apiKey || !apiSettings.baseUrl) {
      setTestResult({ 
        success: false, 
        message: 'Please provide API key and base URL first' 
      });
      return;
    }

    setFetchingModels(true);
    try {
      const response = await fetch(`${apiSettings.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiSettings.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      const models = data.data ? data.data.map(model => model.id) : [];
      
      setAvailableModels(models);
      setTestResult({ 
        success: true, 
        message: `Successfully fetched ${models.length} available models` 
      });
    } catch (error) {
      console.error('Model fetch error:', error);
      setTestResult({ 
        success: false, 
        message: `Failed to fetch models: ${error.message}` 
      });
      
      // Fallback to default models based on base URL
      const defaultModels = getDefaultModelsForProvider(apiSettings.baseUrl);
      setAvailableModels(defaultModels);
    }
    setFetchingModels(false);
  };

  const getDefaultModelsForProvider = (baseUrl) => {
    if (baseUrl.includes('openai.com')) {
      return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    } else if (baseUrl.includes('anthropic.com')) {
      return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
    } else if (baseUrl.includes('localhost:11434')) {
      return ['llama2', 'mistral', 'codellama'];
    } else if (baseUrl.includes('groq.com')) {
      return ['mixtral-8x7b-32768', 'llama2-70b-4096'];
    }
    return ['gpt-3.5-turbo'];
  };

  const processWithLLM = async (query, sources) => {
    const enhancedPrompt = createEnhancedPrompt(query, sources);
    
    try {
      const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model,
          messages: enhancedPrompt,
          max_tokens: apiSettings.maxTokens,
          temperature: apiSettings.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const answer = data.choices[0].message.content;
      const confidence = calculateConfidence(sources, answer);
      
      return {
        answer: answer || "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.",
        confidence: confidence,
        sources_used: sources.map((_, index) => index), // Mark all sources as used
        model_used: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model
      };

    } catch (error) {
      console.error('LLM processing error:', error);
      throw new Error(`Failed to process with AI: ${error.message}`);
    }
  };

  const createEnhancedPrompt = (query, sources) => {
    const systemPrompt = `You are an intelligent research assistant that provides comprehensive, accurate, and well-structured answers based on web research. Your responses should be:

1. **Comprehensive**: Cover all relevant aspects of the query
2. **Well-structured**: Use clear headings, bullet points, and logical organization
3. **Evidence-based**: Reference the provided sources appropriately
4. **Current**: Focus on the most recent and relevant information
5. **Balanced**: Present multiple perspectives when appropriate

Format your response using markdown for better readability:
- Use ## for main sections
- Use ### for subsections  
- Use **bold** for emphasis
- Use bullet points for lists
- Include relevant details and examples

Available sources from web research:
${sources.map((source, index) => `
**Source ${index + 1}: ${source.title}**
- URL: ${source.url}
- Confidence: ${(source.confidence * 100).toFixed(0)}%
- Content: ${source.content}
- Source Type: ${source.source}
`).join('\n')}

Provide a thorough analysis that synthesizes information from these sources while directly addressing the user's query.`;

    const userPrompt = `Based on the web research sources provided, please give me a comprehensive answer to this question: "${query}"

Please structure your response to be informative, well-organized, and directly address what I'm asking about. Include specific details and insights from the sources where relevant.`;

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  };

  const calculateConfidence = (sources, answer) => {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on source quality
    const highQualitySources = sources.filter(s => s.confidence > 0.8).length;
    confidence += highQualitySources * 5;
    
    // Increase confidence based on number of sources
    confidence += Math.min(sources.length * 3, 15);
    
    // Increase confidence based on answer length (more detailed = higher confidence)
    if (answer.length > 500) confidence += 5;
    if (answer.length > 1000) confidence += 5;
    
    return Math.min(confidence, 95); // Cap at 95%
  };

  const getCurrentModel = () => {
    return apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model;
  };

  return {
    apiSettings,
    setApiSettings,
    availableModels,
    setAvailableModels,
    fetchingModels,
    apiTested,
    setApiTested,
    testResult,
    setTestResult,
    customModels,
    setCustomModels,
    isConnected: apiTested,
    testAPI,
    fetchAvailableModels,
    processWithLLM,
    getCurrentModel
  };
};