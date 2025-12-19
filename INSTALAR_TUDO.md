# 🚀 Instalação Completa - ZEX com Kokoro-82M

## Instalação Automática (Windows)

### Opção 1: Script Automático (Recomendado)

1. **Execute o instalador:**
   ```
   install-kokoro.bat
   ```

2. **Inicie o servidor:**
   ```
   start-kokoro.bat
   ```

Pronto! O servidor estará rodando em `http://localhost:8000`

## Instalação Manual

### Passo 1: Verificar Python

Certifique-se de ter Python 3.8 ou superior:

```bash
python --version
```

Se não tiver Python, baixe em: https://www.python.org/downloads/

### Passo 2: Criar Ambiente Virtual

```bash
python -m venv venv
```

### Passo 3: Ativar Ambiente Virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Passo 4: Instalar Dependências

```bash
pip install -r requirements.txt
```

### Passo 5: Instalar Engine TTS

Escolha uma das opções:

#### Opção A: Kokoro-82M (Recomendado)
```bash
pip install kokoro-tts
```

#### Opção B: Piper TTS (Alternativa leve)
```bash
pip install piper-tts
```

#### Opção C: Coqui TTS (Alternativa completa)
```bash
pip install TTS
```

#### Opção D: gTTS (Google TTS - requer internet)
```bash
pip install gtts
```

### Passo 6: Iniciar Servidor

```bash
python kokoro-server.py
```

O servidor estará disponível em `http://localhost:8000`

## Verificar Instalação

Acesse no navegador: `http://localhost:8000`

Você deve ver:
```json
{
  "status": "online",
  "engine": "kokoro",
  "loaded": true,
  "message": "Servidor TTS rodando!"
}
```

## Configuração no ZEX

O ZEX já está configurado! Basta:

1. **Iniciar o servidor Kokoro** (usando `start-kokoro.bat` ou `python kokoro-server.py`)

2. **Abrir o ZEX** no navegador (`index.html`)

3. **Ativar o áudio** clicando no botão de áudio

4. **Fazer uma pergunta** - O ZEX usará Kokoro automaticamente!

## Solução de Problemas

### Erro: "Python não encontrado"
- Instale Python de https://www.python.org/downloads/
- Marque a opção "Add Python to PATH" durante a instalação

### Erro: "pip não encontrado"
```bash
python -m ensurepip --upgrade
```

### Erro: "Kokoro não encontrado"
O servidor tentará usar alternativas automaticamente. Se quiser Kokoro especificamente:
```bash
pip install kokoro-tts
```

### Erro: "Porta 8000 já em uso"
Altere a porta no `kokoro-server.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Mude para 8001
```
E atualize `config.js`:
```javascript
KOKORO_API_URL: 'http://localhost:8001/tts'
```

## Estrutura de Arquivos

```
SITE IA/
├── install-kokoro.bat      # Instalador automático (Windows)
├── start-kokoro.bat        # Iniciar servidor (Windows)
├── requirements.txt        # Dependências Python
├── kokoro-server.py        # Servidor TTS
├── config.js              # Configuração do ZEX
├── script.js              # Código principal
└── index.html             # Interface
```

## Próximos Passos

1. ✅ Instalar dependências
2. ✅ Iniciar servidor Kokoro
3. ✅ Testar no ZEX
4. ✅ Aproveitar voz natural!

---

**Dica**: Mantenha o servidor Kokoro rodando enquanto usar o ZEX para ter a melhor qualidade de voz!

