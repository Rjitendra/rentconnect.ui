export const environment = {
  production: false,
  clientBaseUrl: 'http://localhost:4200',
  apiBaseUrl: 'http://localhost:6001/api/',
  stsBaseUrl: 'http://localhost:5001',
  stripe_api_key:
    'pk_test_51MvHYRIK3Ulf3wYeXnBGACFi832er8zYb67rDWvk0TB2VoBiGOaxLmHchSrjimLUiK3HUuX4Sy8rtHUuKq66ZZSP00EZfFSMXu',
  addressKey: '-ljoqanEokmGQGzEhFJVzQ39085',
  // AI Chatbot Configuration
  ai: {
    // Set to 'backend' to use backend API for AI configuration
    // Set to 'local' to use local environment configuration (for testing)
    mode: 'backend', // 'backend' | 'local'
    // Local configuration (used only when mode is 'local')
    local: {
      provider: 'openai', // 'openai' | 'azure'
      apiKey: '', // Add your OpenAI API key here for local testing
      model: 'gpt-4o', // 'gpt-4', 'gpt-4o', 'gpt-3.5-turbo', etc.
      maxTokens: 1000,
      temperature: 0.7,
    },
  },
};
