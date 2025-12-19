# 🚀 Deploy no Vercel - Guia Completo

## ⚠️ IMPORTANTE: Limitações do Vercel

O **Vercel é uma plataforma para sites estáticos** (HTML, CSS, JavaScript). Ele **NÃO suporta servidores Python** diretamente.

### O que funciona no Vercel:
✅ Frontend (HTML, CSS, JavaScript)  
✅ Site estático completo  
✅ Interface do ZEX  

### O que NÃO funciona no Vercel:
❌ Servidor Python (kokoro-server.py)  
❌ Servidor Node.js (server.js) - precisa de configuração especial  
❌ Kokoro-82M local  

## 🔧 Soluções para Deploy

### Opção 1: Vercel + Servidor Separado (Recomendado)

#### Frontend no Vercel:
1. **Subir apenas arquivos frontend:**
   - `index.html`
   - `styles.css`
   - `script.js`
   - `config.js`

2. **Configurar `config.js` para usar API externa:**
   ```javascript
   USE_PROXY: true,
   PROXY_URL: 'https://seu-servidor-api.railway.app/chat', // Seu servidor Node.js
   
   USE_KOKORO_TTS: false, // Desativar Kokoro local
   FALLBACK_TO_BROWSER_TTS: true // Usar Web Speech API do navegador
   ```

#### Backend em Serviço Separado:

**Opção A: Railway (Recomendado - Grátis)**
1. Crie conta em https://railway.app
2. Conecte seu repositório GitHub
3. Configure para Node.js
4. Deploy do `server.js`

**Opção B: Render (Gratuito)**
1. Crie conta em https://render.com
2. Conecte repositório
3. Configure como Web Service
4. Deploy do `server.js`

**Opção C: Fly.io (Gratuito)**
1. Crie conta em https://fly.io
2. Configure Docker ou Node.js
3. Deploy do servidor

### Opção 2: Usar Apenas Web Speech API

**Mais simples para Vercel:**

1. **No `config.js`:**
   ```javascript
   USE_KOKORO_TTS: false,
   FALLBACK_TO_BROWSER_TTS: true
   ```

2. **Deploy no Vercel:**
   - Funciona 100% estático
   - Usa voz do navegador (menos natural, mas funciona)

### Opção 3: Vercel Serverless Functions

**Para o servidor Node.js:**

1. **Criar pasta `api/` no projeto:**
   ```
   api/
     chat.js
     search.js
   ```

2. **Mover lógica do `server.js` para funções serverless**

3. **Vercel detecta automaticamente**

## 📋 Passo a Passo: Deploy no Vercel

### 1. Preparar Arquivos

**Arquivos já criados:**
- ✅ `.vercelignore` - Ignora arquivos Python
- ✅ `vercel.json` - Configuração correta
- ✅ `.gitignore` - Protege informações sensíveis

**Criar `vercel.json` (opcional):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. Configurar para Produção

**Atualizar `config.js` para produção:**
```javascript
const CONFIG = {
    // ... outras configurações
    
    // Para produção no Vercel
    USE_PROXY: true,
    PROXY_URL: 'https://seu-backend.railway.app/chat', // Seu servidor backend
    
    USE_KOKORO_TTS: false, // Desativar (não funciona no Vercel)
    FALLBACK_TO_BROWSER_TTS: true // Usar voz do navegador
};
```

### 3. Deploy no Vercel

**Método 1: Via GitHub (Recomendado)**
1. Suba seu código no GitHub
2. Acesse https://vercel.com
3. Importe seu repositório
4. Vercel detecta automaticamente
5. Deploy!

**Método 2: Via CLI**
```bash
npm i -g vercel
vercel login
vercel
```

## 🔄 Arquitetura Recomendada

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │  ← index.html, CSS, JS
│   ZEX Site      │
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Railway       │
│   (Backend)     │  ← server.js (Node.js)
│   API Proxy     │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   BigModel API  │
│   (Externa)     │
└─────────────────┘
```

## 📝 Checklist de Deploy

### Antes de Subir no GitHub:
- [ ] Remover chaves de API do código (usar variáveis de ambiente)
- [ ] Configurar `config.js` para produção
- [ ] Testar localmente
- [ ] Criar `.gitignore` apropriado

### No Vercel:
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente (se necessário)
- [ ] Verificar build
- [ ] Testar site publicado

### Backend Separado:
- [ ] Deploy do `server.js` em Railway/Render
- [ ] Configurar CORS
- [ ] Testar API
- [ ] Atualizar URL no `config.js`

## 🔒 Segurança

**NUNCA suba chaves de API no GitHub!**

**Use variáveis de ambiente:**
- No Vercel: Settings → Environment Variables
- No Railway: Variables tab
- No código: `process.env.API_KEY`

## 💡 Dica Final

Para começar rápido:
1. **Deploy frontend no Vercel** (funciona imediatamente)
2. **Use Web Speech API** (voz do navegador)
3. **Depois configure backend** separado se precisar

Isso permite ter o site no ar rapidamente, mesmo sem o servidor backend!

---

**Resumo**: Vercel = Frontend ✅ | Backend Python/Node = Serviço Separado ✅

