"""
Servidor Python para Kokoro-82M TTS
Instale as dependências: pip install fastapi uvicorn

Nota: Kokoro-82M pode ser instalado de diferentes formas:
- pip install kokoro-tts (se disponível)
- Ou usar biblioteca alternativa como piper-tts, coqui-tts, etc.
"""

from fastapi import FastAPI
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import numpy as np
import subprocess
import sys

app = FastAPI()

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variáveis globais
kokoro = None
model_loaded = False
tts_engine = None

# Tentar carregar diferentes engines TTS
def load_tts_engine():
    global kokoro, model_loaded, tts_engine
    
    # Tentar 1: Kokoro direto
    try:
        from kokoro import Kokoro
        kokoro = Kokoro()
        tts_engine = "kokoro"
        model_loaded = True
        print("✅ Kokoro-82M carregado com sucesso!")
        return True
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️ Erro ao carregar Kokoro: {e}")
    
    # Tentar 2: Piper TTS (alternativa leve e gratuita)
    try:
        import piper
        tts_engine = "piper"
        model_loaded = True
        print("✅ Piper TTS carregado como alternativa!")
        return True
    except ImportError:
        pass
    
    # Tentar 3: Coqui TTS (alternativa open source)
    try:
        from TTS.api import TTS
        tts_engine = "coqui"
        model_loaded = True
        print("✅ Coqui TTS carregado como alternativa!")
        return True
    except ImportError:
        pass
    
    # Tentar 4: gTTS (Google TTS - gratuito, requer internet)
    try:
        from gtts import gTTS
        tts_engine = "gtts"
        model_loaded = True
        print("✅ gTTS carregado como alternativa (requer internet)!")
        return True
    except ImportError:
        pass
    
    print("⚠️ Nenhum engine TTS encontrado!")
    print("💡 Instale uma das opções:")
    print("   - pip install kokoro-tts")
    print("   - pip install piper-tts")
    print("   - pip install TTS")
    print("   - pip install gtts")
    return False

# Carregar engine na inicialização
load_tts_engine()

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": tts_engine or "none",
        "loaded": model_loaded,
        "message": "Servidor TTS rodando!" if model_loaded else "Nenhum engine TTS carregado. Instale uma biblioteca TTS."
    }

@app.post("/tts")
async def text_to_speech(request: dict):
    """
    Converte texto em fala usando engine TTS disponível
    
    Body:
    {
        "text": "Texto para falar",
        "language": "pt-BR",
        "voice": "pt-BR"
    }
    """
    if not model_loaded:
        return Response(
            content="Nenhum engine TTS carregado. Verifique a instalação.",
            status_code=503,
            media_type="text/plain"
        )
    
    text = request.get("text", "")
    language = request.get("language", "pt-BR")
    voice = request.get("voice", "pt-BR")
    
    if not text:
        return Response(
            content="Texto não fornecido",
            status_code=400,
            media_type="text/plain"
        )
    
    try:
        audio_bytes = None
        
        # Gerar áudio baseado no engine disponível
        if tts_engine == "kokoro":
            audio_data = kokoro.generate(text, language=language)
            audio_bytes = audio_data.tobytes() if hasattr(audio_data, 'tobytes') else audio_data
            
        elif tts_engine == "piper":
            # Piper TTS
            import tempfile
            import os
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
                tmp_path = tmp.name
            # Comando piper (ajuste conforme instalação)
            subprocess.run(['piper', '--model', 'pt_BR', '--output_file', tmp_path], 
                         input=text.encode(), check=True)
            with open(tmp_path, 'rb') as f:
                audio_bytes = f.read()
            os.unlink(tmp_path)
            
        elif tts_engine == "coqui":
            # Coqui TTS
            from TTS.api import TTS
            import soundfile as sf
            tts = TTS("tts_models/pt/cv/vits")
            audio_data = tts.tts(text)
            # Converter numpy array para bytes
            with io.BytesIO() as buffer:
                sf.write(buffer, audio_data, 22050, format='WAV')
                audio_bytes = buffer.getvalue()
                
        elif tts_engine == "gtts":
            # Google TTS (requer internet)
            from gtts import gTTS
            with io.BytesIO() as buffer:
                tts = gTTS(text=text, lang='pt-br', slow=False)
                tts.write_to_fp(buffer)
                audio_bytes = buffer.getvalue()
        
        if audio_bytes:
            return Response(
                content=audio_bytes,
                media_type="audio/wav",
                headers={
                    "Content-Disposition": "attachment; filename=speech.wav"
                }
            )
        else:
            raise Exception("Falha ao gerar áudio")
            
    except Exception as e:
        print(f"Erro ao gerar áudio: {e}")
        import traceback
        traceback.print_exc()
        return Response(
            content=f"Erro ao gerar áudio: {str(e)}",
            status_code=500,
            media_type="text/plain"
        )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor Kokoro TTS na porta 8000...")
    print("📝 Acesse http://localhost:8000 para verificar o status")
    uvicorn.run(app, host="0.0.0.0", port=8000)

