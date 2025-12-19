// Configuração da API - carrega do config.js se disponível
let API_KEY, API_URL, MODEL, TEMPERATURE, MAX_TOKENS, USE_PROXY, PROXY_URL, MAX_HISTORY, REQUEST_TIMEOUT, ENABLE_WEB_SEARCH, ENABLE_LOCATION, USE_OPENSTREETMAP;

if (typeof CONFIG !== 'undefined') {
    API_KEY = CONFIG.API_KEY;
    API_URL = CONFIG.API_URL;
    MODEL = CONFIG.MODEL;
    TEMPERATURE = CONFIG.TEMPERATURE;
    MAX_TOKENS = CONFIG.MAX_TOKENS;
    USE_PROXY = CONFIG.USE_PROXY || false;
    PROXY_URL = CONFIG.PROXY_URL || 'http://localhost:3000/chat';
    MAX_HISTORY = CONFIG.MAX_HISTORY || 10;
    REQUEST_TIMEOUT = CONFIG.REQUEST_TIMEOUT || 30000;
    ENABLE_WEB_SEARCH = CONFIG.ENABLE_WEB_SEARCH !== false;
    ENABLE_LOCATION = CONFIG.ENABLE_LOCATION !== false;
    USE_OPENSTREETMAP = CONFIG.USE_OPENSTREETMAP !== false;
} else {
    // Valores padrão otimizados
    API_KEY = '27e06879eee54b44a5476f1a2ac8d720.Q1zLFZdoxp0eAD2D';
    API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    MODEL = 'glm-4-flash';
    TEMPERATURE = 0.7;
    MAX_TOKENS = 2000;
    USE_PROXY = false;
    PROXY_URL = 'http://localhost:3000/chat';
    MAX_HISTORY = 10;
    REQUEST_TIMEOUT = 60000;
    ENABLE_WEB_SEARCH = true;
    ENABLE_LOCATION = true;
    USE_OPENSTREETMAP = true;
}

// Variável para armazenar localização do usuário
let userLocation = null;

let currentApiUrl = USE_PROXY ? PROXY_URL : API_URL;

// Variáveis globais
let userName = '';
let userTheme = localStorage.getItem('theme') || 'dark';
let attachments = [];

// Elementos do DOM
const welcomeModal = document.getElementById('welcomeModal');
const mainContainer = document.getElementById('mainContainer');
const userNameInput = document.getElementById('userNameInput');
const startChatBtn = document.getElementById('startChatBtn');
const userNameDisplay = document.getElementById('userNameDisplay');
const welcomeTitle = document.getElementById('welcomeTitle');
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const attachButton = document.getElementById('attachButton');
const fileInput = document.getElementById('fileInput');
// attachmentsPreview removido - anexos ainda funcionam mas sem preview visual
const attachmentsPreview = null;
const status = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const voiceButton = document.getElementById('voiceButton');
const audioToggle = document.getElementById('audioToggle');

// Variáveis de áudio
let audioEnabled = localStorage.getItem('audioEnabled') === 'true';
let recognition = null;
let isRecording = false;
let isDictationMode = false;
let synth = window.speechSynthesis;

// CONFIG será carregado do config.js antes deste script
// Se não estiver disponível, usar valores padrão
const getConfig = () => {
    if (typeof CONFIG !== 'undefined') {
        return CONFIG;
    }
    // Valores padrão se config.js não estiver carregado
    return {
        USE_KOKORO_TTS: true,
        KOKORO_API_URL: 'http://localhost:8000/tts',
        FALLBACK_TO_BROWSER_TTS: true
    };
};

// Histórico de conversa
let conversationHistory = [];

// Função para obter localização do usuário
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocalização não suportada pelo navegador');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                resolve(userLocation);
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Função para buscar locais próximos
async function searchNearbyPlaces(query, location) {
    try {
        if (!location) {
            return null;
        }
        
        // Usar Nominatim (OpenStreetMap) - gratuito, sem API key
        // Primeiro, buscar por nome/tipo
        let searchUrl = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}` +
            `&format=json` +
            `&limit=10` +
            `&addressdetails=1` +
            `&extratags=1`;
        
        let response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'ZEX-AI-Assistant/1.0'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        let data = await response.json();
        
        // Se não encontrar resultados, tentar busca reversa por proximidade
        if (data.length === 0) {
            // Buscar usando coordenadas (reverse geocoding + nearby search)
            searchUrl = `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${location.latitude}` +
                `&lon=${location.longitude}` +
                `&format=json` +
                `&addressdetails=1`;
            
            response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ZEX-AI-Assistant/1.0'
                }
            });
            
            if (response.ok) {
                const reverseData = await response.json();
                // Buscar locais do tipo próximo
                const city = reverseData.address?.city || reverseData.address?.town || '';
                searchUrl = `https://nominatim.openstreetmap.org/search?` +
                    `q=${encodeURIComponent(query + ' ' + city)}` +
                    `&format=json` +
                    `&limit=10` +
                    `&addressdetails=1`;
                
                response = await fetch(searchUrl, {
                    headers: {
                        'User-Agent': 'ZEX-AI-Assistant/1.0'
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                }
            }
        }
        
        if (data.length === 0) {
            return null;
        }
        
        // Calcular distâncias e ordenar
        const placesWithDistance = data.map(place => {
            const distance = calculateDistance(
                location.latitude,
                location.longitude,
                parseFloat(place.lat),
                parseFloat(place.lon)
            );
            
            // Formatar endereço
            const addr = place.address || {};
            const addressStr = [
                addr.road,
                addr.house_number,
                addr.suburb || addr.neighbourhood,
                addr.city || addr.town || addr.village
            ].filter(Boolean).join(', ') || place.display_name;
            
            return {
                name: place.display_name.split(',')[0] || place.name || query,
                address: addressStr,
                fullAddress: place.display_name,
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                distance: distance,
                type: place.type,
                url: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`
            };
        });
        
        // Ordenar por distância
        placesWithDistance.sort((a, b) => a.distance - b.distance);
        
        return placesWithDistance;
    } catch (error) {
        console.error('Erro na busca de locais:', error);
        return null;
    }
}

// Função para calcular distância entre dois pontos (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
}

// Função para buscar informações na web (sem API)
async function searchWeb(query) {
    try {
        const searchUrl = USE_PROXY 
            ? `${PROXY_URL.replace('/chat', '')}/search?q=${encodeURIComponent(query)}`
            : `http://localhost:3000/search?q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Erro na busca:', error);
        return null;
    }
}

// Função para obter mensagem de sistema com data atual
function getSystemMessage() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // getMonth() retorna 0-11
    const year = now.getFullYear();
    const daysOfWeek = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const dayOfWeek = daysOfWeek[now.getDay()];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const monthName = months[now.getMonth()];
    
    const currentDate = `${dayOfWeek}, ${day} de ${monthName} de ${year}`;
    const currentDateShort = `${day}/${month}/${year}`;
    
    return {
        role: 'system',
        content: `Você é o ZEX, um assistente de IA avançado e versátil. Sempre se apresente como ZEX. Você foi criado pela nerd e está aqui para ajudar os usuários com suas perguntas e tarefas. Nunca se apresente como ChatGLM ou qualquer outro nome, apenas como ZEX. Você tem conhecimento e informações atualizadas até dezembro de 2025.

ESTILO DE RESPOSTA - CRÍTICO: Suas respostas DEVEM ser:
- CURTAS e OBJETIVAS: Vá direto ao ponto, sem rodeios ou explicações desnecessárias
- CLARAS: Use linguagem simples e direta, evite jargões complexos quando possível
- COMPLETAS: Entregue todas as informações essenciais que o usuário precisa para responder sua pergunta ou resolver seu problema
- EFICIENTES: Não repita informações, não adicione preâmbulos longos, não faça perguntas retóricas
- DIRETAS: Comece respondendo imediatamente, sem introduções como "Claro!", "Com certeza!", "Vou te ajudar!" - apenas responda

Exemplos do que NÃO fazer:
❌ "Claro! Vou te ajudar com isso. Deixa eu explicar..."
❌ "Essa é uma ótima pergunta! Vou te dar uma resposta completa..."
❌ "Com certeza posso ajudar! Deixa eu te contar sobre..."

Exemplos do que fazer:
✅ [Resposta direta e completa]
✅ [Informação objetiva]
✅ [Solução clara]

Seja conciso mas completo. Entregue tudo que o usuário precisa saber na resposta mais curta possível.

DATA ATUAL DO SISTEMA: Hoje é ${currentDate} (${currentDateShort}). SEMPRE use esta data quando perguntarem sobre a data atual, o dia de hoje, ou qualquer informação relacionada ao tempo atual. Esta é a data real e precisa do sistema do usuário.

BUSCA NA WEB: Quando você não tiver certeza sobre alguma informação, quando precisar de dados atualizados em tempo real, ou quando o usuário pedir para buscar algo, você DEVE informar que vai buscar informações atualizadas. O sistema buscará automaticamente e fornecerá os resultados. Use os resultados da busca para dar uma resposta completa e atualizada. Se a busca automática não estiver disponível, forneça um link de busca formatado. Use o formato: [Buscar no Google: "termo de busca"](https://www.google.com/search?q=TERMO+DE+BUSCA). Sempre codifique os termos de busca na URL (substitua espaços por +).

HABILIDADES DE PROGRAMAÇÃO: Você é um especialista em programação e pode ajudar com:
- Escrever código em qualquer linguagem (JavaScript, Python, Java, C++, HTML, CSS, etc.)
- Debug e correção de erros
- Explicar conceitos de programação
- Criar algoritmos e estruturas de dados
- Desenvolvimento web, mobile, desktop
- Frameworks e bibliotecas
- Arquitetura de software
- Quando fornecer código, sempre formate usando blocos de código markdown com syntax highlighting
- Explique o código que você fornece
- Sugira melhorias e boas práticas

GERAÇÃO DE IMAGENS: Você pode ajudar com geração de imagens:
- Descrever prompts detalhados para geradores de IA (DALL-E, Midjourney, Stable Diffusion)
- Sugerir ferramentas de geração de imagens: [DALL-E](https://openai.com/dall-e-2), [Midjourney](https://www.midjourney.com), [Stable Diffusion](https://stability.ai), [Craiyon](https://www.craiyon.com)
- Criar prompts otimizados para diferentes estilos
- Explicar técnicas de geração de imagens
- Quando o usuário pedir para gerar uma imagem, forneça um prompt detalhado e links para ferramentas

GERAÇÃO DE ÁUDIO: Você pode ajudar com geração de áudio:
- Criar scripts e textos para narração
- Sugerir ferramentas de geração de áudio: [ElevenLabs](https://elevenlabs.io), [Murf](https://murf.ai), [Speechify](https://speechify.com), [Play.ht](https://play.ht)
- Explicar técnicas de síntese de voz
- Criar prompts para geração de música com IA: [Suno](https://suno.ai), [Udio](https://udio.com)
- Quando o usuário pedir para gerar áudio, forneça o texto/script e links para ferramentas

LOCALIZAÇÃO E MAPAS: Você tem acesso à localização do usuário e pode buscar locais próximos. Quando o usuário perguntar sobre locais próximos (ex: "onde é o mercado mais próximo?", "farmácia perto de mim", "restaurante próximo"), você DEVE usar a função de busca de locais fornecida pelo sistema. Os resultados incluirão nome, endereço, distância e link para Google Maps. Sempre forneça os locais ordenados por distância (mais próximo primeiro) e inclua links para o Google Maps. Exemplo de resposta: "Encontrei 3 mercados próximos a você: 1. [Nome do mercado] - 0.5 km - [Ver no mapa](link-google-maps)".

OUTRAS HABILIDADES:
- Análise de dados e visualização
- Redação e edição de textos
- Tradução entre idiomas
- Resolução de problemas técnicos
- Planejamento de projetos
- Tutoriais passo a passo

IMPORTANTE: Sempre que você mencionar ou recomendar sites, fontes online, recursos da internet, organizações, empresas ou qualquer conteúdo que tenha um site oficial, você DEVE fornecer o link completo (URL) diretamente na sua resposta. Use o formato markdown [texto do link](URL) para criar links clicáveis. Por exemplo, se mencionar "site oficial do Corinthians", forneça: [Site oficial do Corinthians](https://www.corinthians.com.br). Sempre inclua links quando referenciar qualquer recurso online.`
    };
}

// Mensagem de sistema inicial (será atualizada dinamicamente)
let systemMessage = getSystemMessage();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já tem nome salvo
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        userName = savedName;
        showMainInterface();
    } else {
        showWelcomeModal();
    }
    
    // Aplicar tema salvo
    applyTheme(userTheme);
    
    // Inicializar áudio
    initializeAudio();
    
    // Event listeners
    setupEventListeners();
});

// Inicializar funcionalidades de áudio
function initializeAudio() {
    // Verificar suporte a Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true; // Modo contínuo para ditado
        recognition.interimResults = true; // Mostrar resultados intermediários
        
        // Variável para armazenar o texto final já processado (anexada ao objeto recognition)
        recognition.finalText = '';
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let newFinalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    newFinalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Adicionar novo texto final ao texto final acumulado
            if (newFinalTranscript) {
                recognition.finalText += newFinalTranscript;
            }
            
            // Atualizar campo de texto: texto final acumulado + texto intermediário
            messageInput.value = recognition.finalText + interimTranscript;
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            
            // Scroll automático
            messageInput.scrollTop = messageInput.scrollHeight;
        };
        
        recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            if (event.error === 'not-allowed') {
                stopDictation();
                status.textContent = 'Permissão de microfone negada. Ative nas configurações do navegador.';
                setTimeout(() => {
                    status.textContent = '';
                }, 3000);
            } else if (event.error === 'no-speech') {
                // Silenciosamente continuar se não houver fala
            } else if (event.error === 'aborted') {
                // Reconhecimento foi interrompido, não fazer nada
            } else {
                status.textContent = 'Erro no reconhecimento. Tentando novamente...';
                setTimeout(() => {
                    status.textContent = '';
                }, 2000);
            }
        };
        
        recognition.onend = () => {
            // Se estiver em modo ditado, reiniciar automaticamente
            if (isDictationMode && isRecording) {
                try {
                    recognition.start();
                } catch (error) {
                    // Se não conseguir reiniciar, parar o modo ditado
                    stopDictation();
                }
            } else {
                stopRecording();
            }
        };
        
        // Não solicitar permissão antecipadamente - será solicitada quando o usuário clicar
    } else {
        if (voiceButton) {
            voiceButton.style.display = 'none';
        }
        console.warn('Reconhecimento de voz não suportado neste navegador');
    }
    
    // Atualizar estado do botão de áudio
    if (audioEnabled && audioToggle) {
        audioToggle.classList.add('active');
    }
}


// Função para processar texto e torná-lo mais natural para fala
function processTextForNaturalSpeech(text) {
    // Limpar texto de markdown e HTML
    let cleanText = text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remover links markdown
        .replace(/```[\s\S]*?```/g, '') // Remover blocos de código
        .replace(/`([^`]+)`/g, '$1') // Remover código inline
        .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remover negrito
        .replace(/\*([^\*]+)\*/g, '$1') // Remover itálico
        .replace(/#{1,6}\s+/g, '') // Remover headers
        .trim();
    
    // Adicionar pausas naturais
    cleanText = cleanText
        .replace(/\.\s+/g, '. ') // Garantir espaço após pontos
        .replace(/,\s*/g, ', ') // Garantir espaço após vírgulas
        .replace(/;\s*/g, '; ') // Garantir espaço após ponto e vírgula
        .replace(/:\s*/g, ': ') // Garantir espaço após dois pontos
        .replace(/\?\s*/g, '? ') // Garantir espaço após interrogação
        .replace(/!\s*/g, '! ') // Garantir espaço após exclamação
    
    // Adicionar pausas curtas em pontos estratégicos (simula respiração)
    cleanText = cleanText
        .replace(/\.\s+([A-Z])/g, '. $1') // Pausa após ponto seguido de maiúscula
        .replace(/([a-z])\s+([A-Z])/g, '$1. $2') // Pausa entre frases sem pontuação
        .replace(/\s+([,;:])/g, '$1') // Remover espaços antes de pontuação
    
    // Adicionar pausas em listas
    cleanText = cleanText.replace(/-\s+/g, '... ') // Pausa antes de itens de lista
        .replace(/\d+\.\s+/g, '... ') // Pausa antes de números de lista
    
    // Melhorar pronúncia de números e siglas
    cleanText = cleanText
        .replace(/(\d+)/g, (match) => {
            // Adicionar pausa antes de números longos
            return match.length > 3 ? ' ' + match + ' ' : match;
        });
    
    return cleanText;
}

// Função para falar texto (Text-to-Speech) - Versão melhorada com Kokoro-82M
async function speakText(text) {
    if (!audioEnabled) return;
    
    // Parar qualquer fala anterior
    if (synth) {
        synth.cancel();
    }
    
    // Processar texto para fala natural
    let cleanText = processTextForNaturalSpeech(text);
    
    // Limitar tamanho para evitar fala muito longa
    const maxLength = 500; // Aumentado para Kokoro que suporta mais
    
    // Obter configuração
    const config = getConfig();
    
    // Tentar usar Kokoro-82M primeiro (se configurado)
    if (config.USE_KOKORO_TTS && config.KOKORO_API_URL) {
        try {
            const success = await speakWithKokoro(cleanText, maxLength, config.KOKORO_API_URL);
            if (success) {
                return; // Sucesso com Kokoro
            }
        } catch (error) {
            console.log('Kokoro não disponível, usando fallback:', error);
        }
    }
    
    // Fallback para Web Speech API do navegador
    if (config.FALLBACK_TO_BROWSER_TTS && synth) {
        if (cleanText.length > maxLength) {
            // Dividir em frases e falar em partes
            const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
            let currentIndex = 0;
            
            function speakNext() {
                if (currentIndex >= sentences.length) return;
                
                let chunk = '';
                while (currentIndex < sentences.length && (chunk + sentences[currentIndex]).length < maxLength) {
                    chunk += sentences[currentIndex];
                    currentIndex++;
                }
                
                if (!chunk && currentIndex < sentences.length) {
                    chunk = sentences[currentIndex].substring(0, maxLength);
                    currentIndex++;
                }
                
                if (chunk.trim()) {
                    speakChunk(chunk.trim(), speakNext);
                }
            }
            
            speakNext();
        } else {
            speakChunk(cleanText);
        }
    }
}

// Função para falar usando Kokoro-82M (voz mais natural)
async function speakWithKokoro(text, maxLength = 500, apiUrl) {
    try {
        // Dividir texto se muito longo
        const chunks = [];
        if (text.length > maxLength) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let currentChunk = '';
            
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length <= maxLength) {
                    currentChunk += sentence;
                } else {
                    if (currentChunk) chunks.push(currentChunk.trim());
                    currentChunk = sentence;
                }
            }
            if (currentChunk) chunks.push(currentChunk.trim());
        } else {
            chunks.push(text);
        }
        
        // Falar cada chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            // Fazer requisição para API Kokoro
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: chunk,
                    language: 'pt-BR',
                    voice: 'pt-BR' // Voz em português brasileiro
                })
            });
            
            if (!response.ok) {
                throw new Error(`Kokoro API error: ${response.status}`);
            }
            
            // Obter áudio como blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Reproduzir áudio
            await playAudio(audioUrl);
            
            // Pausa entre chunks (simula respiração)
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Limpar URL
            URL.revokeObjectURL(audioUrl);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao usar Kokoro TTS:', error);
        return false;
    }
}

// Função para reproduzir áudio a partir de URL
function playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => resolve();
        audio.onerror = (error) => reject(error);
        audio.play().catch(reject);
    });
}

// Função para falar um trecho de texto com parâmetros naturais
function speakChunk(text, callback) {
    if (!text || !text.trim()) {
        if (callback) callback();
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Parâmetros para fala mais natural e humana
    utterance.rate = 0.95; // Ligeiramente mais lento (mais natural)
    utterance.pitch = 1.1; // Tom ligeiramente mais alto (mais expressivo)
    utterance.volume = 0.9; // Volume ligeiramente mais baixo (mais suave)
    
    // Selecionar melhor voz em português
    const voices = synth.getVoices();
    
    // Priorizar vozes brasileiras femininas (geralmente mais naturais)
    let ptVoice = voices.find(voice => 
        voice.lang.startsWith('pt-BR') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('feminina') ||
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('maria'))
    );
    
    // Se não encontrar, tentar qualquer voz brasileira
    if (!ptVoice) {
        ptVoice = voices.find(voice => voice.lang.startsWith('pt-BR'));
    }
    
    // Se ainda não encontrar, tentar qualquer voz em português
    if (!ptVoice) {
        ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
    }
    
    // Fallback para primeira voz disponível
    if (!ptVoice && voices.length > 0) {
        ptVoice = voices[0];
    }
    
    if (ptVoice) {
        utterance.voice = ptVoice;
    }
    
    // Adicionar pequena pausa antes de começar (simula preparação para falar)
    utterance.onstart = () => {
        console.log('ZEX falando:', text.substring(0, 50) + '...');
    };
    
    utterance.onend = () => {
        console.log('Trecho falado');
        // Pequena pausa entre trechos (simula respiração)
        if (callback) {
            setTimeout(callback, 200); // 200ms de pausa entre trechos
        }
    };
    
    utterance.onerror = (event) => {
        console.error('Erro na fala:', event);
        if (callback) callback();
    };
    
    // Adicionar pausas naturais no texto usando SSML-like pauses (se suportado)
    // Para navegadores que suportam, podemos usar pausas mais longas
    synth.speak(utterance);
}

// Função para iniciar modo ditado (toggle)
function toggleDictation() {
    if (!recognition) {
        status.textContent = 'Reconhecimento de voz não disponível neste navegador.';
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
        return;
    }
    
    if (isDictationMode) {
        stopDictation();
    } else {
        startDictation();
    }
}

// Função para iniciar modo ditado
function startDictation() {
    if (isRecording) return;
    
    // Resetar texto final acumulado
    if (recognition) {
        recognition.finalText = '';
    }
    
    // Preservar texto existente
    const existingText = messageInput.value.trim();
    if (existingText && !existingText.endsWith(' ')) {
        recognition.finalText = existingText + ' ';
    }
    
    try {
        recognition.start();
        isRecording = true;
        isDictationMode = true;
        if (voiceButton) {
            voiceButton.classList.add('recording');
            voiceButton.title = 'Ditado ativo - Clique para parar';
        }
        status.textContent = '🎤 Ditado ativo - Fale agora!';
        messageInput.placeholder = '🎤 Ditando... Fale claramente';
        
        // Atualizar campo com texto preservado
        if (recognition.finalText) {
            messageInput.value = recognition.finalText;
        }
    } catch (error) {
        console.error('Erro ao iniciar ditado:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            status.textContent = 'Permissão de microfone negada. Ative nas configurações do navegador.';
        } else if (error.name === 'NotFoundError') {
            status.textContent = 'Microfone não encontrado. Verifique se está conectado.';
        } else {
            status.textContent = 'Erro ao iniciar ditado. Tente novamente.';
        }
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    }
}

// Função para parar modo ditado
function stopDictation() {
    if (!isRecording) return;
    
    isDictationMode = false;
    
    try {
        recognition.stop();
    } catch (error) {
        // Ignorar erro se já estiver parado
    }
    
    isRecording = false;
    if (voiceButton) {
        voiceButton.classList.remove('recording');
        voiceButton.title = 'Ativar ditado (clique para falar)';
    }
    status.textContent = 'Ditado desativado';
    messageInput.placeholder = 'Mensagem';
    
    setTimeout(() => {
        status.textContent = '';
    }, 1500);
}

// Função para parar gravação (compatibilidade)
function stopRecording() {
    if (!isRecording) return;
    
    try {
        recognition.stop();
    } catch (error) {
        // Ignorar erro se já estiver parado
    }
    
    isRecording = false;
    isDictationMode = false;
    if (voiceButton) {
        voiceButton.classList.remove('recording');
        voiceButton.title = 'Ativar ditado (clique para falar)';
    }
    messageInput.placeholder = 'Mensagem';
}

// Toggle de áudio
function toggleAudio() {
    audioEnabled = !audioEnabled;
    localStorage.setItem('audioEnabled', audioEnabled);
    
    if (audioEnabled) {
        audioToggle.classList.add('active');
        status.textContent = '🔊 Áudio ativado - ZEX falará as respostas';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    } else {
        audioToggle.classList.remove('active');
        synth.cancel(); // Parar qualquer fala em andamento
        status.textContent = '🔇 Áudio desativado';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    }
}

// Mostrar modal de boas-vindas
function showWelcomeModal() {
    welcomeModal.style.display = 'flex';
    mainContainer.style.display = 'none';
    userNameInput.focus();
    
    // Enter para começar
    userNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startChat();
        }
    });
}

// Mostrar interface principal
function showMainInterface() {
    welcomeModal.style.display = 'none';
    mainContainer.style.display = 'flex';
    userNameDisplay.textContent = userName;
    welcomeTitle.textContent = `Olá, ${userName}! Como posso ajudar você hoje?`;
    messageInput.focus();
}

// Iniciar chat
function startChat() {
    const name = userNameInput.value.trim();
    if (name) {
        userName = name;
        localStorage.setItem('userName', userName);
        showMainInterface();
    } else {
        userNameInput.style.borderColor = 'var(--error)';
        setTimeout(() => {
            userNameInput.style.borderColor = '';
        }, 2000);
    }
}

// Configurar event listeners
function setupEventListeners() {
    startChatBtn.addEventListener('click', startChat);
    sendButton.addEventListener('click', sendMessage);
    attachButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Botões de áudio
    if (voiceButton) {
        voiceButton.addEventListener('click', toggleDictation);
        voiceButton.title = 'Ativar ditado (clique para falar)';
    }
    
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
    
    // Carregar vozes quando disponíveis
    if (synth) {
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => {
                // Vozes carregadas
            };
        }
    }
    
    // Auto-resize do textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Enviar mensagem ao pressionar Enter (Shift+Enter para nova linha)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Tema claro/escuro
function toggleTheme() {
    userTheme = userTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', userTheme);
    applyTheme(userTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.style.transform = theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Gerenciar seleção de arquivos
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limite
            alert(`Arquivo ${file.name} é muito grande. Máximo: 10MB`);
            return;
        }
        
        attachments.push(file);
        displayAttachment(file);
    });
    
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    fileInput.value = '';
}

// Exibir anexo no preview
function displayAttachment(file) {
    const attachmentDiv = document.createElement('div');
    attachmentDiv.className = 'attachment-item';
    attachmentDiv.dataset.fileName = file.name;
    
    if (file.type.startsWith('image/')) {
        // Preview de imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'attachment-preview';
            img.alt = file.name;
            attachmentDiv.appendChild(img);
            
            const info = document.createElement('div');
            info.className = 'attachment-info';
            info.innerHTML = `
                <div class="attachment-name">${file.name}</div>
                <div class="attachment-size">${formatFileSize(file.size)}</div>
            `;
            attachmentDiv.appendChild(info);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-attachment';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => removeAttachment(file.name);
            attachmentDiv.appendChild(removeBtn);
        };
        reader.readAsDataURL(file);
    } else {
        // Arquivo de texto ou outro
        const icon = document.createElement('div');
        icon.style.cssText = 'width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-dim);';
        icon.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
        `;
        attachmentDiv.appendChild(icon);
        
        const info = document.createElement('div');
        info.className = 'attachment-info';
        info.innerHTML = `
            <div class="attachment-name">${file.name}</div>
            <div class="attachment-size">${formatFileSize(file.size)}</div>
        `;
        attachmentDiv.appendChild(info);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-attachment';
        removeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        `;
        removeBtn.onclick = () => removeAttachment(file.name);
        attachmentDiv.appendChild(removeBtn);
    }
    
    // Preview removido - anexos ainda funcionam
    if (attachmentsPreview) {
        attachmentsPreview.appendChild(attachmentDiv);
    }
}

// Remover anexo
function removeAttachment(fileName) {
    attachments = attachments.filter(f => f.name !== fileName);
    // Preview removido - anexos ainda funcionam
    if (attachmentsPreview) {
        const attachmentDiv = attachmentsPreview.querySelector(`[data-file-name="${fileName}"]`);
        if (attachmentDiv) {
            attachmentDiv.remove();
        }
    }
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Ler conteúdo de arquivo texto
async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Converter imagem para base64
async function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Função para enviar mensagem
async function sendMessage() {
    const message = messageInput.value.trim();
    const hasAttachments = attachments.length > 0;
    
    if (!message && !hasAttachments) return;
    
    // Limpar input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Remover mensagem de boas-vindas se existir
    const welcomeMsg = chatContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Processar anexos
    let attachmentInfo = '';
    let messageContent = message;
    
    if (hasAttachments) {
        const attachmentTexts = [];
        
        for (const file of attachments) {
            if (file.type.startsWith('image/')) {
                // Imagem - converter para base64
                try {
                    const base64 = await imageToBase64(file);
                    attachmentTexts.push(`[Imagem anexada: ${file.name}]\n${base64}`);
                } catch (error) {
                    attachmentTexts.push(`[Erro ao processar imagem: ${file.name}]`);
                }
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                // Arquivo de texto - ler conteúdo
                try {
                    const content = await readTextFile(file);
                    attachmentTexts.push(`[Conteúdo do arquivo ${file.name}]:\n${content}`);
                } catch (error) {
                    attachmentTexts.push(`[Erro ao ler arquivo: ${file.name}]`);
                }
            } else {
                attachmentTexts.push(`[Arquivo anexado: ${file.name} (${formatFileSize(file.size)})]`);
            }
        }
        
        attachmentInfo = '\n\n' + attachmentTexts.join('\n\n');
        messageContent = message + attachmentInfo;
    }
    
    // Adicionar mensagem do usuário ao chat
    let displayMessage = message || 'Arquivo(s) anexado(s)';
    if (attachments.length > 0) {
        displayMessage += ` (${attachments.length} arquivo${attachments.length > 1 ? 's' : ''})`;
    }
    addMessage(displayMessage, 'user', attachments);
    
    // Limpar anexos
    attachments = [];
    // Preview removido - anexos ainda funcionam
    if (attachmentsPreview) {
        attachmentsPreview.innerHTML = '';
    }
    
    // Desabilitar botão e input
    sendButton.disabled = true;
    messageInput.disabled = true;
    attachButton.disabled = true;
    status.textContent = 'Enviando mensagem...';
    status.classList.add('loading');
    
    // Mostrar indicador de digitação
    const typingIndicator = showTypingIndicator();
    
    try {
        // Verificar se precisa buscar locais próximos
        const needsLocation = ENABLE_LOCATION && (
            message.toLowerCase().includes('próximo') ||
            message.toLowerCase().includes('próxima') ||
            message.toLowerCase().includes('perto') ||
            message.toLowerCase().includes('perto de mim') ||
            message.toLowerCase().includes('mais próximo') ||
            message.toLowerCase().includes('mais próxima') ||
            message.toLowerCase().includes('onde é') ||
            message.toLowerCase().includes('onde fica') ||
            message.toLowerCase().includes('localização') ||
            message.toLowerCase().includes('endereço de') ||
            message.toLowerCase().match(/\b(mercado|farmácia|hospital|restaurante|padaria|posto|banco|supermercado|shopping|cinema|teatro)\b.*(próximo|perto|próxima)/i)
        );
        
        let locationResults = null;
        if (needsLocation) {
            try {
                status.textContent = 'Obtendo sua localização...';
                
                // Obter localização do usuário
                if (!userLocation) {
                    userLocation = await getUserLocation();
                }
                
                if (userLocation) {
                    status.textContent = 'Buscando locais próximos...';
                    
                    // Extrair tipo de local da mensagem
                    const placeTypes = ['mercado', 'farmácia', 'hospital', 'restaurante', 'padaria', 'posto', 'banco', 'supermercado', 'shopping', 'cinema', 'teatro', 'padaria', 'loja'];
                    let searchQuery = message;
                    
                    // Tentar extrair o tipo de local
                    for (const type of placeTypes) {
                        if (message.toLowerCase().includes(type)) {
                            searchQuery = type + ' ' + (message.match(/\b(próximo|perto|próxima)\b/i) ? 'próximo' : '');
                            break;
                        }
                    }
                    
                    locationResults = await searchNearbyPlaces(searchQuery, userLocation);
                    
                    if (locationResults && locationResults.length > 0) {
                        // Adicionar resultados de locais ao contexto
                        const locationInfo = `\n\n[LOCAIS PRÓXIMOS ENCONTRADOS - Sua localização: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}]\n` +
                            locationResults.slice(0, 5).map((place, idx) => 
                                `${idx + 1}. ${place.name}\n   Endereço: ${place.address || place.fullAddress || 'N/A'}\n   Distância: ${place.distance.toFixed(2)} km\n   Link Google Maps: ${place.url}`
                            ).join('\n\n');
                        messageContent += locationInfo;
                    } else {
                        // Se não encontrar, adicionar link de busca do Google Maps
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
                        messageContent += `\n\n[Não encontrei locais específicos próximos, mas você pode buscar aqui: ${googleMapsUrl}]`;
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar locais:', error);
                // Continuar sem informações de localização
            }
        }
        
        // Verificar se precisa buscar informações na web
        const needsSearch = ENABLE_WEB_SEARCH && (
            message.toLowerCase().includes('buscar') ||
            message.toLowerCase().includes('pesquisar') ||
            message.toLowerCase().includes('procurar') ||
            message.toLowerCase().includes('encontrar') ||
            message.toLowerCase().includes('notícias') ||
            message.toLowerCase().includes('atual') ||
            message.toLowerCase().includes('hoje') ||
            message.toLowerCase().includes('agora')
        );
        
        let searchResults = null;
        if (needsSearch && (USE_PROXY || window.location.hostname === 'localhost')) {
            status.textContent = 'Buscando informações na web...';
            const searchQuery = message; // Usar a mensagem como query de busca
            searchResults = await searchWeb(searchQuery);
            
            if (searchResults && searchResults.length > 0) {
                // Adicionar resultados da busca ao contexto
                const searchInfo = `\n\n[INFORMAÇÕES BUSCADAS NA WEB]\n` +
                    searchResults.slice(0, 3).map((result, idx) => 
                        `${idx + 1}. ${result.title}\n   URL: ${result.url}\n   ${result.snippet || ''}`
                    ).join('\n\n');
                messageContent += searchInfo;
            }
        }
        
        // Adicionar mensagem do usuário ao histórico
        conversationHistory.push({
            role: 'user',
            content: messageContent
        });
        
        // Limitar histórico para melhor performance
        let messagesToSend = conversationHistory;
        if (conversationHistory.length > MAX_HISTORY * 2) {
            messagesToSend = [
                conversationHistory[0],
                ...conversationHistory.slice(-MAX_HISTORY * 2 + 1)
            ];
        }
        
        // Atualizar mensagem de sistema com data atual
        systemMessage = getSystemMessage();
        
        // Adicionar mensagem de sistema no início se não existir
        const hasSystemMessage = messagesToSend.some(msg => msg.role === 'system');
        if (!hasSystemMessage) {
            messagesToSend = [
                systemMessage,
                ...messagesToSend
            ];
        } else {
            // Atualizar mensagem de sistema existente com data atual
            const systemIndex = messagesToSend.findIndex(msg => msg.role === 'system');
            if (systemIndex >= 0) {
                messagesToSend[systemIndex] = systemMessage;
            } else {
                messagesToSend.unshift(systemMessage);
            }
        }
        
        // Preparar dados da requisição
        const requestBody = {
            model: MODEL,
            messages: messagesToSend,
            temperature: TEMPERATURE,
            max_tokens: MAX_TOKENS,
            stream: false
        };
        
        // Preparar headers
        let headers = {
            'Content-Type': 'application/json'
        };
        
        if (USE_PROXY) {
            // Se usar proxy, não enviar a chave (o servidor adiciona)
        } else {
            headers['Authorization'] = `Bearer ${API_KEY}`;
        }
        
        // Criar AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        status.textContent = 'Processando resposta...';
        
        // Fazer requisição com timeout
        let response;
        try {
            response = await fetch(currentApiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error(`Tempo de espera esgotado (${REQUEST_TIMEOUT/1000}s). A API está demorando muito para responder. Tente usar o servidor proxy ou verifique sua conexão.`);
            }
            if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
                throw new Error('Erro de CORS detectado. Por favor, use o servidor proxy. Execute: npm install && npm start e depois ative USE_PROXY no config.js');
            }
            throw fetchError;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error?.message) {
                    errorMessage += ` - ${errorJson.error.message}`;
                }
            } catch (e) {
                if (errorText) {
                    errorMessage += ` - ${errorText.substring(0, 200)}`;
                }
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Remover indicador de digitação
        typingIndicator.remove();
        
        // Extrair resposta da IA
        let aiMessage = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
            aiMessage = data.choices[0].message.content;
        } else if (data.choices && data.choices[0] && data.choices[0].text) {
            aiMessage = data.choices[0].text;
        } else if (data.content) {
            aiMessage = data.content;
        } else if (data.message) {
            aiMessage = data.message;
        } else if (data.text) {
            aiMessage = data.text;
        } else if (data.response) {
            aiMessage = data.response;
        } else if (typeof data === 'string') {
            aiMessage = data;
        } else {
            console.log('Resposta completa da API:', data);
            aiMessage = 'Resposta recebida, mas formato não reconhecido. Verifique o console para mais detalhes.';
        }
        
        if (!aiMessage || aiMessage.trim() === '') {
            throw new Error('Resposta vazia da API');
        }
        
        // Adicionar resposta da IA com efeito de digitação
        addMessageWithTypewriter(aiMessage, 'ai');
        
        // Falar a resposta se áudio estiver ativado
        if (audioEnabled) {
            // Aguardar um pouco para a digitação começar
            setTimeout(() => {
                speakText(aiMessage);
            }, 500);
        }
        
        // Adicionar resposta ao histórico
        conversationHistory.push({
            role: 'assistant',
            content: aiMessage
        });
        
        status.textContent = '';
        status.classList.remove('loading');
        
    } catch (error) {
        // Remover indicador de digitação
        typingIndicator.remove();
        
        // Mostrar erro
        console.error('Erro completo:', error);
        
        let errorMsg = `❌ Erro ao conectar com a API\n\n${error.message}\n\n`;
        
        // Mensagens específicas baseadas no tipo de erro
        if (error.message.includes('Tempo de espera esgotado')) {
            errorMsg += `💡 Soluções:\n` +
                `1. Use o servidor proxy (recomendado):\n` +
                `   - Execute: npm install\n` +
                `   - Execute: npm start\n` +
                `   - No config.js, mude USE_PROXY para true\n\n` +
                `2. Aumente o timeout no config.js (REQUEST_TIMEOUT)\n` +
                `3. Verifique sua conexão com a internet\n` +
                `4. Tente novamente em alguns instantes`;
        } else if (error.message.includes('CORS')) {
            errorMsg += `💡 Solução: Use o servidor proxy para evitar problemas de CORS.\n\n` +
                `1. Execute: npm install\n` +
                `2. Execute: npm start\n` +
                `3. No config.js, mude: USE_PROXY: true`;
        } else {
            errorMsg += `💡 Verifique:\n` +
                `1. URL da API: ${currentApiUrl}\n` +
                `2. Chave de API válida\n` +
                `3. Documentação oficial da BigModel\n` +
                `4. Tente usar o servidor proxy (npm start)`;
        }
        
        addMessage(errorMsg, 'ai', true);
        status.textContent = 'Erro ao enviar mensagem. Veja a mensagem acima para soluções.';
        status.classList.remove('loading');
    } finally {
        // Reabilitar botão e input
        sendButton.disabled = false;
        messageInput.disabled = false;
        attachButton.disabled = false;
        messageInput.focus();
    }
}

// Função para adicionar mensagem ao chat
function addMessage(text, sender, fileAttachments = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Adicionar anexos se houver
    if (fileAttachments && fileAttachments.length > 0) {
        const attachmentsDiv = document.createElement('div');
        attachmentsDiv.style.cssText = 'margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px;';
        
        fileAttachments.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.cssText = 'max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 8px; border: 1px solid var(--border);';
                    contentDiv.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                const fileBadge = document.createElement('div');
                fileBadge.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px; margin-top: 8px;';
                fileBadge.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>${file.name}</span>
                `;
                contentDiv.appendChild(fileBadge);
            }
        });
    }
    
    // Formatar texto (suporte básico a markdown)
    const textDiv = document.createElement('div');
    textDiv.innerHTML = formatMessage(text);
    contentDiv.appendChild(textDiv);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll para baixo
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Função para adicionar mensagem com efeito de digitação (typewriter)
function addMessageWithTypewriter(text, sender) {
    // Criar estrutura da mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'typewriter-text';
    contentDiv.appendChild(textDiv);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll para baixo
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Efeito de digitação
    let index = 0;
    const speed = 20; // Velocidade de digitação (ms por caractere)
    
    function typeWriter() {
        if (index < text.length) {
            // Adicionar próximo caractere
            const char = text[index];
            textDiv.textContent += char;
            
            // Scroll automático enquanto digita
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            index++;
            
            // Velocidade variável: mais rápido para espaços, mais lento para pontuação
            let delay = speed;
            if (char === ' ') {
                delay = speed * 0.5;
            } else if (char === '.' || char === '!' || char === '?') {
                delay = speed * 2;
            } else if (char === ',' || char === ';' || char === ':') {
                delay = speed * 1.5;
            }
            
            setTimeout(typeWriter, delay);
        } else {
            // Quando terminar, formatar o texto com markdown e remover cursor
            const formatted = formatMessage(text);
            textDiv.innerHTML = formatted;
            textDiv.classList.add('typing-complete');
        }
    }
    
    // Iniciar digitação
    typeWriter();
}

// Função para formatar mensagem (suporte completo a markdown)
function formatMessage(text) {
    // Escapar HTML primeiro
    let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Blocos de código (```linguagem\ncódigo\n```)
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const language = lang || 'text';
        return `<pre class="code-block"><code class="language-${language}">${code.trim()}</code></pre>`;
    });
    
    // Links markdown [texto](url) - fazer antes de outras formatações
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">$1</a>');
    
    // Negrito (fazer primeiro)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Código inline (fazer antes de itálico para evitar conflitos)
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
    
    // Itálico (fazer depois, evitando conflitos com código)
    formatted = formatted.replace(/(?<!`)\*([^*\n`]+?)\*(?!`)/g, '<em>$1</em>');
    
    // Listas numeradas
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    
    // Listas com marcadores
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Quebras de linha
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Função para mostrar indicador de digitação
function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = '<span></span><span></span><span></span>';
    
    messageDiv.appendChild(indicatorDiv);
    chatContainer.appendChild(messageDiv);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}
