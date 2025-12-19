// Configuração da API BigModel
// Ajuste estes valores conforme a documentação oficial da BigModel

const CONFIG = {
    // Sua chave de API
    API_KEY: '27e06879eee54b44a5476f1a2ac8d720.Q1zLFZdoxp0eAD2D',
    
    // URL base da API - Endpoint oficial da BigModel
    API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    
    // Modelo a ser usado (glm-4-flash é mais rápido, glm-4.6 é mais completo)
    // Tente 'glm-4-flash' para respostas mais rápidas
    MODEL: 'glm-4-flash',
    
    // Parâmetros da API
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000, // Reduzido para respostas mais rápidas
    
    // Usar servidor intermediário para evitar CORS
    // Se você criar o server.js, mude para true
    USE_PROXY: false,
    PROXY_URL: 'http://localhost:3000/chat',
    
    // Limitar histórico de conversa para melhor performance
    MAX_HISTORY: 10, // Mantém apenas as últimas 10 mensagens
    REQUEST_TIMEOUT: 60000, // 60 segundos (aumentado para APIs mais lentas)
    
    // Busca na web (gratuita, sem necessidade de API)
    ENABLE_WEB_SEARCH: true, // Ative para o ZEX buscar informações na web automaticamente
    USE_DUCKDUCKGO: true, // Usa DuckDuckGo (gratuito, sem API key) em vez de Google
    
    // Localização e mapas
    ENABLE_LOCATION: true, // Ative para o ZEX usar localização
    USE_GOOGLE_MAPS: false, // Se true, usa Google Maps API (requer chave)
    GOOGLE_MAPS_API_KEY: '', // Sua chave da Google Maps API (opcional)
    USE_OPENSTREETMAP: true, // Usa OpenStreetMap/Nominatim (gratuito, sem API key)
    
    // Sistema de voz (Text-to-Speech)
    USE_KOKORO_TTS: true, // Usar Kokoro-82M para voz mais natural (requer servidor local)
    KOKORO_API_URL: 'http://localhost:8000/tts', // URL do servidor Kokoro (se usar servidor local)
    FALLBACK_TO_BROWSER_TTS: true // Se Kokoro não estiver disponível, usar Web Speech API do navegador
};

// Se você souber o endpoint correto da BigModel, descomente e ajuste:
// CONFIG.API_URL = 'https://seu-endpoint-aqui.com/api/chat';

