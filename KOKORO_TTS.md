# 🎤 Kokoro-82M - Sistema de Voz Avançado para ZEX

## Visão Geral

O **Kokoro-82M** é considerado o "rei" do custo-benefício em 2025. É um modelo de apenas **82MB** que entrega uma voz humana quase perfeita, com entonação e ritmo naturais.

### Por que Kokoro-82M?

✅ **Extremamente leve** - Roda em qualquer PC  
✅ **Qualidade superior** - Supera vozes pagas  
✅ **Vozes em Português Brasileiro** - Já possui modelos excelentes  
✅ **Gratuito e Open Source** - Sem custos de API  
✅ **Local** - Sua voz não sai do seu computador  

## 🚀 Instalação

### Opção 1: Servidor Python (Recomendado)

#### Passo 1: Instalar Python
Certifique-se de ter Python 3.8+ instalado.

#### Passo 2: Instalar Dependências

```bash
pip install fastapi uvicorn
pip install kokoro-tts
# ou
pip install git+https://github.com/hexgrad/kokoro-tts.git
```

#### Passo 3: Executar Servidor

```bash
python kokoro-server.py
```

O servidor estará disponível em `http://localhost:8000`

### Opção 2: Usar API Pública (se disponível)

Se houver uma API pública do Kokoro, você pode configurar a URL em `config.js`:

```javascript
KOKORO_API_URL: 'https://api-kokoro-exemplo.com/tts'
```

## ⚙️ Configuração no ZEX

O ZEX já está configurado para usar Kokoro! Basta:

1. **Ativar no config.js** (já está ativado por padrão):
```javascript
USE_KOKORO_TTS: true,
KOKORO_API_URL: 'http://localhost:8000/tts',
FALLBACK_TO_BROWSER_TTS: true
```

2. **Iniciar o servidor Kokoro**:
```bash
python kokoro-server.py
```

3. **Ativar áudio no ZEX**: Clique no botão de áudio na interface

## 🔄 Funcionamento

### Fluxo de Voz:

1. **ZEX recebe resposta** da IA
2. **Tenta usar Kokoro-82M** primeiro (voz mais natural)
3. **Se Kokoro não estiver disponível**, usa Web Speech API do navegador (fallback)
4. **Reproduz áudio** com qualidade máxima

### Vantagens do Kokoro:

- **Voz mais natural** - Entonação e ritmo humanos
- **Respiração natural** - Pausas e respirações realistas
- **Português brasileiro nativo** - Pronúncia perfeita
- **Sem custos** - Totalmente gratuito
- **Privacidade** - Tudo processado localmente

## 📊 Comparação

| Característica | Web Speech API | Kokoro-82M |
|----------------|----------------|------------|
| Qualidade | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Naturalidade | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Tamanho | N/A (navegador) | 82MB |
| Português BR | ⚠️ Limitado | ✅ Nativo |
| Custo | Gratuito | Gratuito |
| Requer Servidor | ❌ | ✅ |

## 🛠️ Solução de Problemas

### Erro: "Kokoro não disponível"

**Causa**: Servidor não está rodando ou não está acessível.

**Solução**:
1. Verifique se o servidor está rodando: `python kokoro-server.py`
2. Verifique a URL em `config.js`: `http://localhost:8000/tts`
3. Teste acessando: `http://localhost:8000` no navegador

### Erro: "Modelo não carregado"

**Causa**: Biblioteca Kokoro não instalada corretamente.

**Solução**:
```bash
pip install --upgrade kokoro-tts
# ou
pip install git+https://github.com/hexgrad/kokoro-tts.git
```

### Voz ainda usando Web Speech API

**Causa**: Servidor Kokoro não está respondendo.

**Solução**:
1. Verifique se o servidor está rodando
2. Verifique os logs do servidor
3. Teste a API manualmente:
```bash
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Olá, sou o ZEX", "language": "pt-BR"}'
```

## 🎯 Recursos Avançados

### Personalizar Voz

No servidor Python, você pode ajustar:

```python
# Velocidade
audio_data = kokoro.generate(text, speed=1.0)

# Tom
audio_data = kokoro.generate(text, pitch=1.0)

# Emoção
audio_data = kokoro.generate(text, emotion="happy")
```

### Múltiplas Vozes

Kokoro suporta diferentes vozes. Ajuste no request:

```javascript
{
    "text": "Texto para falar",
    "language": "pt-BR",
    "voice": "pt-BR-female" // ou pt-BR-male
}
```

## 📚 Recursos

- **GitHub Kokoro**: https://github.com/hexgrad/kokoro-tts
- **Documentação**: Consulte a documentação oficial do projeto
- **Comunidade**: Participe da comunidade para dicas e suporte

## 🔒 Privacidade

✅ **100% Local** - Todo processamento acontece no seu computador  
✅ **Sem Dados Enviados** - Nenhum texto é enviado para servidores externos  
✅ **Open Source** - Código aberto e auditável  

## 💡 Dicas

1. **Performance**: Kokoro é leve, mas para melhor performance, use GPU se disponível
2. **Cache**: Considere cachear áudios frequentes para respostas mais rápidas
3. **Qualidade**: Ajuste parâmetros no servidor para melhor qualidade
4. **Fallback**: Mantenha `FALLBACK_TO_BROWSER_TTS: true` para garantir que sempre funcione

## 🚀 Próximos Passos

1. ✅ Instalar Kokoro
2. ✅ Configurar servidor
3. ✅ Testar voz no ZEX
4. ✅ Ajustar parâmetros conforme necessário
5. ✅ Desfrutar de voz natural e profissional!

---

**Nota**: O Kokoro-82M é uma das melhores opções gratuitas e locais para TTS em 2025. Com apenas 82MB, entrega qualidade profissional!

