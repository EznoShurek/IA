# 🔍 Integração com Google Search

O ZEX agora está configurado para usar o Google para buscar informações quando necessário.

## Como Funciona

### Modo Automático (Atual)
O ZEX está instruído a:
- Sempre fornecer links de busca no Google quando não tiver certeza sobre algo
- Criar links formatados para buscas no Google
- Sugerir buscas quando precisar de informações atualizadas em tempo real

**Exemplo de uso:**
- Usuário: "Com quem o Corinthians joga domingo?"
- ZEX: "Para informações atualizadas sobre os jogos do Corinthians, recomendo buscar: [Buscar no Google: "Corinthians jogos domingo"](https://www.google.com/search?q=Corinthians+jogos+domingo)"

### Modo API (Opcional - Avançado)

Para busca automática via API do Google, você precisaria:

1. **Obter chave da Google Custom Search API:**
   - Acesse: https://developers.google.com/custom-search/v1/overview
   - Crie um projeto no Google Cloud Console
   - Ative a Custom Search API
   - Obtenha sua chave de API

2. **Criar um mecanismo de busca:**
   - Acesse: https://programmablesearchengine.google.com/
   - Crie um novo mecanismo de busca
   - Obtenha o Engine ID

3. **Configurar no config.js:**
   ```javascript
   USE_GOOGLE_SEARCH: true,
   GOOGLE_SEARCH_API_KEY: 'sua-chave-aqui',
   GOOGLE_SEARCH_ENGINE_ID: 'seu-engine-id-aqui'
   ```

**Nota:** A busca automática via API requer configuração adicional e tem limites de uso gratuito (100 buscas/dia).

## Recomendação

O modo atual (links de busca) é mais simples e não requer configuração adicional. O ZEX já está configurado para fornecer links de busca do Google automaticamente quando necessário.

