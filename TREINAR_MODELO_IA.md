# 🤖 Guia para Treinar Seu Próprio Modelo de IA

## Visão Geral

Este guia te ajudará a começar a treinar seu próprio modelo de IA baseado no GLM, para que você possa ter o ZEX funcionando sem depender de serviços pagos.

## 📋 Pré-requisitos

### Hardware Necessário
- **GPU NVIDIA** com pelo menos 8GB VRAM (recomendado: 16GB+)
- **RAM**: Mínimo 16GB (recomendado: 32GB+)
- **Armazenamento**: Pelo menos 100GB livres (SSD recomendado)
- **CPU**: Processador moderno (Intel i7/AMD Ryzen 7 ou superior)

### Software Necessário
- **Python 3.8+**
- **CUDA** (para GPU NVIDIA)
- **Git**
- **Docker** (opcional, mas recomendado)

## 🚀 Opções de Treinamento

### Opção 1: Fine-tuning do GLM (Recomendado para Iniciantes)

#### Passo 1: Preparar Ambiente

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets accelerate peft
pip install jupyter notebook
```

#### Passo 2: Baixar Modelo Base GLM

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

# Baixar modelo GLM-4 ou similar
model_name = "THUDM/glm-4-9b-chat"  # ou outro modelo GLM disponível
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)
```

#### Passo 3: Preparar Dados de Treinamento

Crie um arquivo `training_data.json` com conversas do ZEX:

```json
[
    {
        "instruction": "Você é o ZEX, um assistente de IA.",
        "input": "Olá, como você está?",
        "output": "Olá! Estou funcionando perfeitamente. Como posso ajudar você hoje?"
    },
    {
        "instruction": "Você é o ZEX, um assistente de IA.",
        "input": "Que dia é hoje?",
        "output": "Hoje é [data atual]. Como posso ajudar?"
    }
]
```

#### Passo 4: Script de Fine-tuning

Crie `train_zex.py`:

```python
from transformers import Trainer, TrainingArguments
from datasets import Dataset
import json

# Carregar dados
with open('training_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

dataset = Dataset.from_list(data)

# Configurar treinamento
training_args = TrainingArguments(
    output_dir="./zex_model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    fp16=True,  # Usar precisão mista
    learning_rate=2e-5,
)

# Criar trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

# Treinar
trainer.train()
trainer.save_model("./zex_model_final")
```

### Opção 2: Usar LoRA (Low-Rank Adaptation) - Mais Eficiente

LoRA permite treinar com menos recursos:

```python
from peft import LoraConfig, get_peft_model, TaskType

# Configurar LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,  # Rank
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["query_key_value", "dense"]
)

# Aplicar LoRA ao modelo
model = get_peft_model(model, lora_config)
```

### Opção 3: Treinamento em Cloud (Sem GPU Local)

#### Google Colab (Gratuito com limitações)
- Acesso a GPU T4 (gratuito, mas com timeout)
- GPU A100 (pago)

#### Kaggle (Gratuito)
- GPU P100 (30h/semana grátis)

#### RunPod / Vast.ai (Pago, mas barato)
- Aluguel de GPU por hora
- A partir de $0.20/hora

## 📊 Coletar Dados de Treinamento

### Estratégias para Dados

1. **Conversas do ZEX Atual**
   - Exportar histórico de conversas
   - Limpar e formatar dados
   - Criar pares pergunta-resposta

2. **Dados Públicos**
   - Português brasileiro
   - Conversas naturais
   - Perguntas e respostas

3. **Gerar Dados Sintéticos**
   - Usar o próprio ZEX para gerar exemplos
   - Diversificar perguntas e respostas

### Script para Exportar Conversas

Adicione ao `script.js`:

```javascript
function exportConversations() {
    const conversations = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zex_conversations.json';
    a.click();
}
```

## 🎯 Estrutura de Projeto Recomendada

```
zex-training/
├── data/
│   ├── raw/              # Dados brutos
│   ├── processed/        # Dados processados
│   └── training_data.json
├── models/
│   ├── base/             # Modelo base GLM
│   └── zex/              # Modelo treinado
├── scripts/
│   ├── prepare_data.py   # Preparar dados
│   ├── train.py          # Treinar modelo
│   └── evaluate.py       # Avaliar modelo
├── notebooks/
│   └── exploration.ipynb # Análise exploratória
└── requirements.txt
```

## 🔧 Integração com o ZEX

### Opção A: API Local

Criar servidor Flask/FastAPI:

```python
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
model = pipeline("text-generation", model="./zex_model_final")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    response = model(message, max_length=200, temperature=0.7)
    return jsonify({'response': response[0]['generated_text']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Opção B: Integração Direta (Ollama)

Usar Ollama para rodar modelos localmente:

```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo GLM (se disponível) ou usar Llama
ollama pull llama2

# Criar modelo customizado
ollama create zex -f Modelfile
```

## 📈 Métricas de Avaliação

- **Perplexidade**: Quão bem o modelo prevê o próximo token
- **BLEU Score**: Similaridade com respostas de referência
- **Avaliação Humana**: Testes com usuários reais

## 💰 Custos Estimados

### Treinamento Local
- **Eletricidade**: ~$50-100/mês (dependendo da região)
- **Hardware**: Investimento inicial $1000-3000

### Treinamento em Cloud
- **Google Colab Pro**: $10/mês
- **RunPod**: ~$50-200 (dependendo do tempo de treinamento)
- **AWS/GCP**: $100-500 (dependendo da configuração)

## 🚧 Desafios e Soluções

### Desafio 1: Falta de GPU
**Solução**: Usar LoRA ou treinar em cloud

### Desafio 2: Poucos Dados
**Solução**: 
- Usar dados públicos
- Gerar dados sintéticos
- Fine-tuning com poucos exemplos (few-shot)

### Desafio 3: Qualidade do Modelo
**Solução**: 
- Iterar no treinamento
- Ajustar hiperparâmetros
- Coletar mais dados de qualidade

## 📚 Recursos Úteis

- **Hugging Face**: https://huggingface.co
- **Papers with Code**: https://paperswithcode.com
- **GLM GitHub**: https://github.com/THUDM/GLM
- **Transformers Docs**: https://huggingface.co/docs/transformers

## 🎓 Próximos Passos

1. **Começar Pequeno**: Treine com poucos dados primeiro
2. **Iterar**: Melhore gradualmente
3. **Avaliar**: Teste com usuários reais
4. **Expandir**: Adicione mais dados e recursos

## ⚠️ Considerações Importantes

- **Tempo**: Treinamento pode levar horas ou dias
- **Recursos**: Requer hardware adequado
- **Manutenção**: Modelos precisam de atualização periódica
- **Custos**: Mesmo local, há custos de energia

## 🔄 Alternativa: Modelos Open Source

Se treinar for muito complexo, considere:

- **Llama 2** (Meta) - Open source, pode rodar localmente
- **Mistral** - Modelo open source eficiente
- **Ollama** - Facilita rodar modelos localmente
- **LM Studio** - Interface gráfica para modelos locais

Esses podem ser uma ponte até você ter seu modelo próprio treinado.

