interface WebScraper {
  scrapeQuery: (query: string) => Promise<{
    sources: Array<{
      url: string;
      title: string;
      content: string;
      confidence: number;
      source: string;
    }>;
  }>;
}

interface LLMProvider {
  // State properties
  apiSettings: {
    baseUrl: string;
    apiKey: string;
    model: string;
    customModel: string;
    useCustomModel: boolean;
    maxTokens: number;
    temperature: number;
  };
  isConnected: boolean;
  testResult: {
    success?: boolean;
    message?: string;
    testing?: boolean;
  } | null;
  
  // Missing properties that your hook returns:
  availableModels: string[];
  fetchingModels: boolean;
  customModels: string[];
  
  // Methods
  processWithLLM: (query: string, sources: any[]) => Promise<{
    answer: string;
    confidence: number;
    sources_used: number[];
    model_used: string;
  }>;
  getCurrentModel: () => string;
  testAPI: () => Promise<void>;
  fetchAvailableModels: () => Promise<void>;
  
  // Setter methods
  setApiSettings: (settings: any | ((prev: any) => any)) => void;
  setAvailableModels: (models: string[]) => void;
  setApiTested: (tested: boolean) => void;  // This was missing
  setTestResult: (result: {
    success?: boolean;
    message?: string;
    testing?: boolean;
  } | null) => void;
  setCustomModels: (models: string[]) => void;
}

interface VoiceInput {
  isListening: boolean;
  isSupported: boolean;  // Add this if your voice hook has it
  startListening: (callback: (transcript: string) => void) => void;
  stopListening: () => void;
}

export declare function useWebScraper(): WebScraper;
export declare function useLLMProvider(): LLMProvider;
export declare function useVoiceInput(): VoiceInput;