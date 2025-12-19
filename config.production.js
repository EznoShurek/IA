// Configuração para PRODUÇÃO (Vercel)
// Renomeie este arquivo para config.js antes de fazer deploy

const CONFIG = {
    // Sua chave de API (use variável de ambiente no Vercel)
    API_KEY: process.env.API_KEY || '27e06879eee54b44a5476f1a2ac8d720.Q1zLFZdoxp0eAD2D',
    
    // URL base da API - Endpoint oficial da BigModel
    API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    
    // Modelo a ser usado
    MODEL: 'glm-4-flash',
    
    // Parâmetros da API
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000,
    
    // Usar servidor intermediário (backend separado)
    USE_PROXY: true,
    // ATUALIZE ESTA URL com seu servidor backend (Railway, Render, etc.)
    PROXY_URL: process.env.PROXY_URL || 'https://seu-backend.railway.app/chat',
    
    // Limitar histórico de conversa
    MAX_HISTORY: 10,
    REQUEST_TIMEOUT: 60000,
    
    // Busca na web
    ENABLE_WEB_SEARCH: true,
    USE_DUCKDUCKGO: true,
    
    // Localização e mapas
    ENABLE_LOCATION: true,
    USE_GOOGLE_MAPS: false,
    GOOGLE_MAPS_API_KEY: '',
    USE_OPENSTREETMAP: true,
    
    // Sistema de voz - DESATIVAR Kokoro para Vercel
    USE_KOKORO_TTS: false, // Não funciona no Vercel (é estático)
    KOKORO_API_URL: '', // Não usado em produção
    FALLBACK_TO_BROWSER_TTS: true // Usar Web Speech API do navegador
};

