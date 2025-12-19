# 📍 Integração com Localização

O ZEX agora pode buscar locais próximos a você usando sua localização GPS!

## ✅ Como Funciona

### 1. Permissão de Localização
- Na primeira vez que você perguntar sobre locais próximos, o navegador solicitará permissão de localização
- A localização é armazenada apenas durante a sessão (não é salva permanentemente)

### 2. Busca Automática
- O ZEX detecta automaticamente quando você pergunta sobre locais próximos
- Busca usando OpenStreetMap/Nominatim (gratuito, sem API key)
- Calcula distâncias e ordena do mais próximo ao mais distante

### 3. Tipos de Locais Suportados
- Mercados e supermercados
- Farmácias
- Hospitais
- Restaurantes
- Padarias
- Postos de gasolina
- Bancos
- Shoppings
- Cinemas
- Teatros
- E muito mais!

## 🎯 Exemplos de Perguntas

- "Onde é o mercado mais próximo de mim?"
- "Farmácia perto de mim"
- "Restaurante próximo"
- "Onde fica o hospital mais próximo?"
- "Banco perto de mim"
- "Shopping próximo"

## 📊 O que o ZEX Fornece

Para cada local encontrado:
- **Nome** do estabelecimento
- **Endereço completo**
- **Distância** em quilômetros
- **Link para Google Maps** (para ver no mapa e obter rotas)

## 🔒 Privacidade

- A localização é solicitada apenas quando necessário
- Não é salva permanentemente
- Usada apenas para buscar locais próximos
- Você pode negar a permissão (o ZEX fornecerá links de busca como alternativa)

## ⚙️ Configuração

No `config.js`:
```javascript
ENABLE_LOCATION: true  // Ativa/desativa busca de locais
USE_OPENSTREETMAP: true // Usa OpenStreetMap (gratuito)
```

## 💡 Tecnologias Usadas

- **Geolocalização do navegador**: Para obter sua localização
- **OpenStreetMap/Nominatim**: Para buscar locais (gratuito, sem API key)
- **Cálculo de distância**: Fórmula de Haversine para calcular distâncias precisas
- **Google Maps**: Links para visualização e rotas

## 🚀 Vantagens

- ✅ **Gratuito** - Não precisa de API key do Google Maps
- ✅ **Automático** - Detecta quando precisa buscar
- ✅ **Preciso** - Calcula distâncias reais
- ✅ **Privado** - Usa OpenStreetMap (mais privado)

Teste agora perguntando: "Onde é o mercado mais próximo de mim?"

