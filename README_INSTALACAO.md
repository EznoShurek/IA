# 🚀 Instalação Rápida - ZEX com Kokoro-82M

## ⚡ Instalação Automática (Windows)

### Método 1: Script Batch (Mais Simples)

1. **Clique duas vezes em:**
   ```
   install-kokoro.bat
   ```

2. **Aguarde a instalação terminar**

3. **Inicie o servidor:**
   ```
   start-kokoro.bat
   ```

### Método 2: PowerShell (Mais Detalhado)

1. **Abra PowerShell na pasta do projeto**

2. **Execute:**
   ```powershell
   .\install.ps1
   ```

3. **Inicie o servidor:**
   ```
   start-kokoro.bat
   ```

## 📋 O que será instalado

- ✅ Python ambiente virtual
- ✅ FastAPI (servidor web)
- ✅ Uvicorn (servidor ASGI)
- ✅ Dependências básicas
- ✅ Tentativa de instalar Kokoro-82M

## 🎯 Após Instalação

1. **Inicie o servidor:**
   ```
   start-kokoro.bat
   ```

2. **Verifique se está rodando:**
   Acesse: http://localhost:8000
   
   Você deve ver:
   ```json
   {
     "status": "online",
     "engine": "kokoro",
     "loaded": true
   }
   ```

3. **Abra o ZEX:**
   - Abra `index.html` no navegador
   - Ative o áudio
   - Faça uma pergunta!

## 🔧 Se algo der errado

### Python não encontrado
- Baixe em: https://www.python.org/downloads/
- Marque "Add Python to PATH" durante instalação

### Erro ao ativar ambiente virtual
Execute no PowerShell como Administrador:
```powershell
Set-ExecutionPolicy RemoteSigned
```

### Porta 8000 ocupada
Altere a porta no `kokoro-server.py` (última linha):
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

E atualize `config.js`:
```javascript
KOKORO_API_URL: 'http://localhost:8001/tts'
```

## 📁 Arquivos Criados

Após instalação, você terá:
```
SITE IA/
├── venv/                    # Ambiente virtual Python
├── install-kokoro.bat       # Instalador
├── start-kokoro.bat         # Iniciar servidor
├── requirements.txt          # Dependências
└── kokoro-server.py         # Servidor TTS
```

## ✅ Pronto!

Agora você tem:
- ✅ Servidor Kokoro configurado
- ✅ ZEX pronto para usar voz natural
- ✅ Tudo instalado e funcionando!

**Dica**: Mantenha o servidor rodando enquanto usa o ZEX!

