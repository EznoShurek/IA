@echo off
echo ========================================
echo   Iniciando Servidor Kokoro-82M
echo ========================================
echo.

REM Verificar se ambiente virtual existe
if not exist "venv\" (
    echo [ERRO] Ambiente virtual nao encontrado!
    echo Execute install-kokoro.bat primeiro
    pause
    exit /b 1
)

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

REM Verificar se Kokoro está instalado
python -c "import kokoro" >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Kokoro nao encontrado. Tentando instalar...
    pip install kokoro-tts
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar Kokoro
        echo Tente instalar manualmente: pip install kokoro-tts
        pause
        exit /b 1
    )
)

echo.
echo [OK] Iniciando servidor na porta 8000...
echo [INFO] Acesse http://localhost:8000 para verificar o status
echo [INFO] Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar servidor
python kokoro-server.py

pause

