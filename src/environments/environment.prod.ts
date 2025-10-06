export const environment = {
  production: true,
  clientBaseUrl: 'https://lordhood.me',
  apiBaseUrl: 'https://lordhood.me/Api/api/',
  stsBaseUrl: 'https://lordhood.me/STS',
  stripe_api_key:
    'pk_live_51MvHYRIK3Ulf3wYeZOfJM87YtyFkvitmCYHqITd2NVdlsgFMyWWYBWfuJ65xFp2HDnps7UpAfw9FHeia6OhjEJ6Y00jdoaoqZ2',
  addressKey: '-ljoqanEokmGQGzEhFJVzQ39085',
  // AI Chatbot Configuration
  ai: {
    mode: 'backend', // 'backend' | 'local'
    local: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.7,
    },
  },
};
