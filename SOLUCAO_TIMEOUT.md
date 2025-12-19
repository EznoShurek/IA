# 🔧 Solução para Problemas de Timeout

Se você está recebendo erros de timeout, siga estas soluções:

## ✅ Solução 1: Usar Servidor Proxy (RECOMENDADO)

O servidor proxy resolve problemas de CORS e pode melhorar a performance:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```

3. **Ative o proxy no `config.js`:**
   ```javascript
   USE_PROXY: true
   ```

4. **Recarregue a página e teste novamente**

## ✅ Solução 2: Aumentar Timeout

Se a API está demorando muito, aumente o timeout:

1. Abra o arquivo `config.js`
2. Aumente o valor de `REQUEST_TIMEOUT`:
   ```javascript
   REQUEST_TIMEOUT: 90000 // 90 segundos
   ```

## ✅ Solução 3: Verificar Conexão

- Verifique sua conexão com a internet
- Tente acessar a API da BigModel em outro navegador
- Verifique se há firewall bloqueando a conexão

## ✅ Solução 4: Reduzir Tamanho da Mensagem

- Reduza o número de mensagens no histórico
- Diminua o `MAX_TOKENS` no `config.js`
- Evite anexar arquivos muito grandes

## 📝 Notas

- O timeout padrão foi aumentado para 60 segundos
- O servidor proxy tem timeout de 90 segundos
- Problemas de CORS são resolvidos automaticamente com o proxy

