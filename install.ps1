# Script de Instalação Completa - ZEX com Kokoro-82M
# PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalando Kokoro-82M para ZEX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
Write-Host "[1/5] Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale Python 3.8+ de https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Criar ambiente virtual
Write-Host ""
Write-Host "[2/5] Criando ambiente virtual..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️ Ambiente virtual já existe. Removendo..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao criar ambiente virtual" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Ambiente virtual criado!" -ForegroundColor Green

# Ativar ambiente virtual
Write-Host ""
Write-Host "[3/5] Ativando ambiente virtual..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao ativar ambiente virtual" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Ambiente virtual ativado!" -ForegroundColor Green

# Atualizar pip
Write-Host ""
Write-Host "[4/5] Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "✅ Pip atualizado!" -ForegroundColor Green

# Instalar dependências
Write-Host ""
Write-Host "[5/5] Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Tentar instalar Kokoro
Write-Host ""
Write-Host "Tentando instalar Kokoro-82M..." -ForegroundColor Yellow
pip install kokoro-tts 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Kokoro-82M instalado!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Kokoro-82M não disponível via pip" -ForegroundColor Yellow
    Write-Host "💡 O servidor tentará usar alternativas automaticamente" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o servidor, execute:" -ForegroundColor Yellow
Write-Host "  .\start-kokoro.bat" -ForegroundColor Cyan
Write-Host "  ou" -ForegroundColor Yellow
Write-Host "  python kokoro-server.py" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"

