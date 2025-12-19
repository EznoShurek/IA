# 🎤 Funcionalidade de Áudio do ZEX

## Visão Geral

O ZEX agora possui funcionalidades completas de áudio, permitindo conversas por voz com o assistente de IA. Isso inclui:

1. **Text-to-Speech (TTS)**: ZEX fala suas respostas em voz alta
2. **Speech-to-Text (STT)**: Você pode falar suas perguntas em vez de digitar

## 🎯 Funcionalidades

### 1. Botão de Áudio (Toggle)
- **Localização**: Ao lado do campo de texto, antes do botão de enviar
- **Função**: Ativa/desativa a fala do ZEX
- **Indicador Visual**: Botão fica destacado quando ativado
- **Persistência**: A preferência é salva no navegador

### 2. Botão de Voz (Microfone) - Modo Ditado
- **Localização**: Entre o botão de anexar e o campo de texto
- **Função**: Ativa modo de ditado contínuo
- **Como Usar**: 
  - Clique no botão para ativar o ditado
  - O botão ficará vermelho e pulsando
  - Fale sua mensagem - o texto aparecerá em tempo real
  - Continue falando - o ditado continua ativo
  - Clique novamente para parar o ditado
  - **Permissão**: Na primeira vez, o navegador solicitará permissão de microfone (apenas uma vez)

### 3. Fala Automática
- Quando o áudio está ativado, ZEX fala automaticamente todas as respostas
- O texto é limpo de markdown e formatação antes de ser falado
- Usa voz em português brasileiro quando disponível

## 🔧 Requisitos Técnicos

### Navegadores Suportados

#### Text-to-Speech (ZEX falar):
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

#### Speech-to-Text (Você falar):
- ✅ Chrome/Edge (Chromium) - Suporte completo
- ⚠️ Firefox - Suporte limitado
- ⚠️ Safari - Suporte limitado

**Nota**: O reconhecimento de voz funciona melhor no Chrome/Edge devido ao suporte nativo da Web Speech API.

## 📱 Como Usar

### Ativar Áudio (ZEX falar):
1. Clique no botão de áudio (ícone de alto-falante) na barra de entrada
2. O botão ficará destacado indicando que está ativo
3. Todas as respostas do ZEX serão faladas automaticamente

### Falar com ZEX (Modo Ditado):
1. Clique no botão de microfone para ativar
2. O botão ficará vermelho indicando que está ativo
3. Fale sua mensagem - o texto aparecerá em tempo real no campo
4. Continue falando - o ditado continua ativo
5. Clique novamente no botão para parar
6. Edite o texto se necessário
7. Pressione Enter ou clique em Enviar

### Desativar Áudio:
1. Clique novamente no botão de áudio
2. O botão voltará ao estado normal
3. ZEX não falará mais as respostas

## 🎨 Indicadores Visuais

### Botão de Áudio Ativo:
- Fundo azul claro
- Borda azul brilhante
- Efeito de brilho (glow)

### Botão de Voz Ativo (Ditado):
- Fundo vermelho claro
- Borda vermelha
- Animação de pulso contínua
- Ponto vermelho pulsante no centro
- Status: "🎤 Ditado ativo - Fale agora!"
- Placeholder: "🎤 Ditando... Fale claramente"

## ⚙️ Configurações

### Voz do ZEX:
- **Idioma**: Português Brasileiro (pt-BR)
- **Velocidade**: Normal (1.0x)
- **Tom**: Normal (1.0)
- **Volume**: Máximo (1.0)

### Reconhecimento de Voz:
- **Idioma**: Português Brasileiro (pt-BR)
- **Modo**: Contínuo (ditado ativo até desativar)
- **Resultados**: Intermediários e finais (mostra texto em tempo real)
- **Permissão**: Solicitada apenas na primeira vez que ativar

## 🔒 Privacidade

- **Microfone**: Ativo apenas quando o modo ditado está ligado
- **Permissões**: O navegador solicitará permissão apenas na primeira vez que ativar o ditado
- **Dados**: O áudio é processado localmente pelo navegador
- **Armazenamento**: Apenas a preferência de áudio ativado/desativado é salva
- **Controle**: Você pode desativar o ditado a qualquer momento clicando no botão novamente

## 🐛 Solução de Problemas

### ZEX não está falando:
1. Verifique se o botão de áudio está ativado (destacado)
2. Verifique o volume do navegador e do sistema
3. Tente recarregar a página
4. Verifique se há outras abas reproduzindo áudio

### Reconhecimento de voz não funciona:
1. Verifique se está usando Chrome ou Edge
2. Verifique as permissões do microfone nas configurações do navegador
3. Certifique-se de que o microfone está conectado e funcionando
4. Tente recarregar a página

### Permissão de microfone negada:
1. Vá para Configurações do Navegador
2. Procure por "Permissões" ou "Privacidade"
3. Encontre "Microfone"
4. Permita o acesso para este site
5. Recarregue a página

## 💡 Dicas

1. **Fale claramente**: Para melhor reconhecimento, fale de forma clara e pausada
2. **Ambiente silencioso**: Reduz ruídos de fundo para melhor reconhecimento
3. **Modo contínuo**: O ditado continua ativo até você desativar - fale quantas frases quiser
4. **Texto em tempo real**: Veja o texto aparecendo enquanto fala (resultados intermediários)
5. **Edite se necessário**: Você pode editar o texto gerado antes de enviar
6. **Combine métodos**: Use ditado para mensagens longas e digitação para mensagens complexas
7. **Permissão única**: Após conceder permissão na primeira vez, não precisará mais autorizar

## 🚀 Melhorias Futuras

- [ ] Ajuste de velocidade de fala
- [ ] Seleção de voz (masculina/feminina)
- [ ] Reconhecimento contínuo (sem precisar segurar)
- [ ] Comandos de voz para ações (ex: "limpar chat")
- [ ] Suporte para múltiplos idiomas

## 📝 Notas Técnicas

- Usa `window.speechSynthesis` para Text-to-Speech
- Usa `SpeechRecognition` ou `webkitSpeechRecognition` para Speech-to-Text
- Limita texto falado a 500 caracteres para evitar fala muito longa
- Remove formatação markdown antes de falar para melhor clareza
- Suporta dispositivos móveis com eventos touch

