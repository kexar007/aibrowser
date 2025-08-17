import { useState, useEffect } from 'react';
import type { LLMProvider } from './types';

interface TestResult {
  success?: boolean;
  message?: string;
  testing?: boolean;
}

// Extend the LLMProvider interface to handle null testResult
interface LLMProviderWithNull extends LLMProvider {
  testResult: TestResult | null;
  setTestResult: (result: TestResult | null) => void;
}

interface ModelResponse {
  id: string;
  object: string;
  data: Array<{ id: string }>;
}

export const useLLMProvider = (): LLMProvider => {
  const [masterPassword, setMasterPassword] = useState('');

  useEffect(() => {
    // Generate a random master password on first load
    if (!sessionStorage.getItem('masterPassword')) {
      const newPassword = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
      sessionStorage.setItem('masterPassword', newPassword);
      setMasterPassword(newPassword);
    } else {
      setMasterPassword(sessionStorage.getItem('masterPassword')!);
    }
  }, []);

  const encryptData = async (data: string): Promise<string> => {
    if (!masterPassword) return data;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const passwordBuffer = encoder.encode(masterPassword);
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    const encryptedArray = new Uint8Array(encryptedContent);
    const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(encryptedArray, salt.length + iv.length);
    
    return btoa(String.fromCharCode(...result));
  };

  const decryptData = async (encryptedData: string): Promise<string> => {
    if (!masterPassword || !encryptedData) return '';
    
    const decoder = new TextDecoder();
    const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const salt = encryptedArray.slice(0, 16);
    const iv = encryptedArray.slice(16, 28);
    const content = encryptedArray.slice(28);
    
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    try {
      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        content
      );
      
      return decoder.decode(decryptedContent);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  };

  const [isDecrypting, setIsDecrypting] = useState(true);
  const [apiSettings, setApiSettings] = useState(() => {
    const saved = localStorage.getItem('llmApiSettings');
    if (!saved) return {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      customModel: '',
      useCustomModel: false,
      maxTokens: 4000,
      temperature: 0.7
    };

    // Try to decrypt API key
    const parsed = JSON.parse(saved);
    if (parsed.encryptedApiKey) {
      decryptData(parsed.encryptedApiKey).then(decrypted => {
        if (decrypted) {
          setApiSettings((prev: any) => ({ ...prev, apiKey: decrypted }));
        }
      });
      return { ...parsed, apiKey: '' };
    }
    
    return parsed;
  });

  useEffect(() => {
    if (apiSettings.apiKey === '') {
      setIsDecrypting(true);
    } else {
      setIsDecrypting(false);
    }
  }, [apiSettings.apiKey]);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [apiTested, setApiTested] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [customModels, setCustomModels] = useState<string[]>(() => {
    const saved = localStorage.getItem('customModels');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saveSettings = async () => {
      const settingsToSave = { ...apiSettings };
      
      // Encrypt API key before saving
      if (apiSettings.apiKey) {
        settingsToSave.encryptedApiKey = await encryptData(apiSettings.apiKey);
        delete settingsToSave.apiKey;
      }
      
      localStorage.setItem('llmApiSettings', JSON.stringify(settingsToSave));
    };
    
    saveSettings();
  }, [apiSettings, masterPassword]);

  useEffect(() => {
    localStorage.setItem('customModels', JSON.stringify(customModels));
  }, [customModels]);

  const testAPI = async (): Promise<void> => {
    if (!apiSettings.apiKey || !apiSettings.baseUrl) {
      setTestResult({ 
        success: false, 
        message: 'Please provide API key and base URL' 
      });
      return;
    }

    setTestResult({ testing: true });
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSettings.apiKey}`
      };

      const body: Record<string, any> = {
        model: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      };

      // Add DeepSeek-specific parameters
      if (apiSettings.baseUrl.includes('deepseek.com')) {
        body.stream = false;
        // Ensure model is set for DeepSeek
        body.model = apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model;
      }

      const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch {}
        throw new Error(`API test failed: ${response.status} ${response.statusText} - ${errorBody}`);
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
        message: `Connection failed: ${error instanceof Error ? error.message : String(error)}` 
      });
      setApiTested(false);
    }
  };

  const fetchAvailableModels = async (): Promise<void> => {
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

      const responseData = await response.json();
      let models: string[] = [];
      
      if (apiSettings.baseUrl.includes('deepseek.com')) {
        // DeepSeek returns models in a different format
        models = responseData.data?.map((model: any) => model.id) || [];
      } else {
        models = responseData.data ? responseData.data.map((model: any) => model.id) : [];
      }
      
      setAvailableModels(models);
      setTestResult({ 
        success: true, 
        message: `Successfully fetched ${models.length} available models` 
      });
    } catch (error) {
      console.error('Model fetch error:', error);
      setTestResult({ 
        success: false, 
        message: `Failed to fetch models: ${error instanceof Error ? error.message : String(error)}` 
      });
      
      // Fallback to default models based on base URL
      const defaultModels = getDefaultModelsForProvider(apiSettings.baseUrl);
      setAvailableModels(defaultModels);
    }
    setFetchingModels(false);
  };

  const getDefaultModelsForProvider = (baseUrl: string): string[] => {
    if (baseUrl.includes('openai.com')) {
      return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    } else if (baseUrl.includes('anthropic.com')) {
      return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
    } else if (baseUrl.includes('localhost:11434')) {
      return ['llama2', 'mistral', 'codellama'];
    } else if (baseUrl.includes('groq.com')) {
      return ['mixtral-8x7b-32768', 'llama2-70b-4096'];
    } else if (baseUrl.includes('deepseek.com')) {
      return ['deepseek-chat', 'deepseek-coder'];
    }
    return ['gpt-3.5-turbo'];
  };

  const processWithLLM = async (query: string, sources: any[]): Promise<{
    answer: string;
    confidence: number;
    sources_used: number[];
    model_used: string;
  }> => {
    const enhancedPrompt = createEnhancedPrompt(query, sources);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSettings.apiKey}`
      };

      const body: Record<string, any> = {
        model: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model,
        messages: enhancedPrompt,
        max_tokens: apiSettings.maxTokens,
        temperature: apiSettings.temperature,
      };

      // Add DeepSeek-specific parameters
      if (apiSettings.baseUrl.includes('deepseek.com')) {
        body.stream = false;
      }

      const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        let errorMsg = `API call failed: ${response.status} ${response.statusText}`;
        
        // Handle DeepSeek-specific errors
        if (apiSettings.baseUrl.includes('deepseek.com') && responseData.error) {
          errorMsg += ` - ${responseData.error.message || responseData.error.code}`;
        }
        
        throw new Error(errorMsg);
      }
      
      const answer = responseData.choices[0].message.content;
      const confidence = calculateConfidence(sources, answer);
      
    
      return {
        answer: answer || "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.",
        confidence: confidence,
        sources_used: sources.map((_, index) => index),
        model_used: apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model
      };

    } catch (error) {
      console.error('LLM processing error:', error);
      throw new Error(`Failed to process with AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const createEnhancedPrompt = (query: string, sources: any[]) => {
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

  const calculateConfidence = (sources: any[], answer: string): number => {
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

  const getCurrentModel = (): string => {
    return apiSettings.useCustomModel ? apiSettings.customModel : apiSettings.model;
  };

  // Replace the return statement in your useLLMProvider.ts with this:

// Replace the return statement in your useLLMProvider.ts with this:

return {
  apiSettings,
  isConnected: apiTested,
  testResult: testResult || null,
  availableModels,
  fetchingModels,
  customModels,
  testAPI,
  fetchAvailableModels,
  processWithLLM,
  getCurrentModel,
  setApiSettings,
  setAvailableModels,
  setApiTested,           // ← Add this missing function
  setTestResult: (result: TestResult | null) => setTestResult(result),
  setCustomModels
};
};