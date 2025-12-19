# Chat com IA - BigModel

Site de conversação com inteligência artificial usando a API da BigModel.

## 🚀 Como usar

### Opção 1: Com servidor proxy (Recomendado - evita problemas de CORS)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Abra o arquivo `config.js` e mude:
   ```javascript
   USE_PROXY: true
   ```

4. Abra o arquivo `index.html` no seu navegador

5. Digite sua mensagem e pressione Enter ou clique no botão de enviar

### Opção 2: Sem servidor (pode ter problemas de CORS)

1. Abra o arquivo `index.html` no seu navegador
2. Digite sua mensagem e pressione Enter ou clique no botão de enviar
3. A IA responderá suas perguntas!

**Nota**: Se encontrar erro de CORS, use a Opção 1 com o servidor proxy.

## ⚙️ Configuração

A chave da API já está configurada. Para alterar as configurações:

1. Abra o arquivo `config.js`
2. Modifique os valores conforme necessário:
   - `API_KEY`: Sua chave de API da BigModel
   - `API_URL`: URL do endpoint da API (ajuste conforme a documentação oficial)
   - `MODEL`: Modelo de IA a ser usado
   - `TEMPERATURE` e `MAX_TOKENS`: Parâmetros da API

**Importante**: Se a API não funcionar, verifique a documentação oficial da BigModel para o endpoint correto e atualize o `API_URL` no arquivo `config.js`.

## 📝 Notas

- Se a API retornar erro 404, verifique a URL do endpoint na documentação oficial da BigModel
- O formato da resposta pode variar dependendo da API. Se necessário, ajuste a função `sendMessage()` em `script.js` para corresponder ao formato de resposta da BigModel

## 🎨 Recursos

- Interface moderna e responsiva
- Suporte a markdown básico nas respostas
- Indicador de digitação
- Histórico de conversa
- Design adaptável para mobile

