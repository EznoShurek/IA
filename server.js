// Servidor intermediário para evitar problemas de CORS
// Execute: node server.js
// Depois atualize config.js: USE_PROXY = true

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

// Sua chave de API da BigModel
const API_KEY = '27e06879eee54b44a5476f1a2ac8d720.Q1zLFZdoxp0eAD2D';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// Middleware
app.use(cors()); // Permitir requisições de qualquer origem
app.use(express.json());

// Rota para chat
app.post('/chat', async (req, res) => {
    try {
        console.log('📨 Recebida requisição:', {
            model: req.body.model,
            messages: req.body.messages?.length || 0
        });
        
        const response = await axios.post(API_URL, req.body, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 90000 // 90 segundos de timeout
        });
        
        console.log('✅ Resposta recebida da API');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({
                error: 'Timeout - A API demorou muito para responder',
                message: 'Tente novamente ou reduza o tamanho da mensagem'
            });
        } else if (error.response) {
            res.status(error.response.status).json({
                error: error.message,
                details: error.response.data
            });
        } else {
            res.status(500).json({
                error: error.message || 'Erro desconhecido',
                message: 'Verifique sua conexão e tente novamente'
            });
        }
    }
});

// Rota para busca na web (sem necessidade de API)
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Parâmetro "q" (query) é obrigatório' });
        }
        
        console.log('🔍 Buscando:', query);
        
        // Usar DuckDuckGo Instant Answer API (gratuito, sem API key)
        // Alternativa: usar DuckDuckGo HTML
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        
        try {
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const data = response.data;
            const results = [];
            
            // Adicionar resposta direta se disponível
            if (data.AbstractText) {
                results.push({
                    title: data.Heading || query,
                    url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                    snippet: data.AbstractText
                });
            }
            
            // Adicionar links relacionados
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                data.RelatedTopics.slice(0, 4).forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.substring(0, 100),
                            url: topic.FirstURL,
                            snippet: topic.Text.substring(0, 200)
                        });
                    }
                });
            }
            
            // Se não houver resultados, criar link de busca
            if (results.length === 0) {
                results.push({
                    title: `Buscar: ${query}`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    snippet: 'Clique para buscar no Google'
                });
            }
            
            console.log(`✅ Encontrados ${results.length} resultados`);
            res.json({ query, results });
            
        } catch (apiError) {
            // Fallback: retornar link de busca do Google
            console.log('⚠️ API não disponível, usando fallback');
            res.json({
                query,
                results: [{
                    title: `Buscar: ${query}`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    snippet: 'Clique para buscar no Google'
                }]
            });
        }
        
    } catch (error) {
        console.error('❌ Erro na busca:', error.message);
        res.status(500).json({
            error: 'Erro ao buscar informações',
            message: error.message
        });
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        message: 'Servidor proxy da BigModel está rodando!',
        endpoints: {
            chat: '/chat (POST)',
            search: '/search?q=termo (GET)'
        }
    });
});

app.listen(port, () => {
    console.log(`\n🚀 Servidor proxy rodando em http://localhost:${port}`);
    console.log(`📡 Endpoint: http://localhost:${port}/chat\n`);
});

