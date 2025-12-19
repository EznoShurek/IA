# 🔍 Busca na Web - Sem Necessidade de API

O ZEX agora pode buscar informações na web automaticamente, **sem precisar de API do Google**!

## ✅ Como Funciona

### 1. Servidor Proxy com Busca
O servidor proxy (`server.js`) agora tem uma rota de busca que usa DuckDuckGo (gratuito, sem API key).

### 2. Busca Automática
O ZEX detecta automaticamente quando precisa buscar informações e faz a busca antes de responder.

### 3. Palavras-chave que ativam a busca:
- "buscar"
- "pesquisar"
- "procurar"
- "encontrar"
- "notícias"
- "atual"
- "hoje"
- "agora"

## 🚀 Como Usar

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Iniciar o servidor
```bash
npm start
```

### Passo 3: Ativar o proxy no config.js
```javascript
USE_PROXY: true
```

### Passo 4: Ativar busca web (já está ativado por padrão)
```javascript
ENABLE_WEB_SEARCH: true
```

## 📝 Exemplo de Uso

**Usuário:** "Buscar notícias sobre Corinthians hoje"

**ZEX:**
1. Detecta que precisa buscar
2. Faz busca automática na web
3. Recebe resultados
4. Usa os resultados para dar uma resposta completa e atualizada

## ⚙️ Configuração

No `config.js`:
```javascript
ENABLE_WEB_SEARCH: true  // Ativa/desativa busca automática
USE_DUCKDUCKGO: true    // Usa DuckDuckGo (gratuito)
```

## 🔧 Como Funciona Tecnicamente

1. O ZEX detecta palavras-chave na mensagem
2. Faz requisição para `/search?q=termo` no servidor proxy
3. O servidor busca no DuckDuckGo (sem API key)
4. Retorna os primeiros 5 resultados
5. O ZEX usa esses resultados para responder

## 💡 Vantagens

- ✅ **Gratuito** - Não precisa de API key
- ✅ **Automático** - Detecta quando precisa buscar
- ✅ **Rápido** - Busca em tempo real
- ✅ **Privado** - Usa DuckDuckGo (mais privado que Google)

## ⚠️ Nota

A busca funciona melhor quando o servidor proxy está rodando (`npm start`). Se não estiver rodando, o ZEX ainda fornecerá links de busca do Google como fallback.

