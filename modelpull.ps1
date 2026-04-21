# Pulls all Ollama cloud models required for Vectra MagicBar

Write-Host "Pulling Vectra AI Models from Ollama..." -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────" -ForegroundColor DarkGray

ollama pull nemotron-3-super:cloud
ollama pull minimax-m2.5:cloud
ollama pull deepseek-v3.1:671b-cloud
ollama pull gemini-3-flash-preview:cloud
ollama pull minimax-m2.7:cloud
ollama pull glm-5.1:cloud
ollama pull glm-5:cloud
ollama pull qwen3-coder-next:cloud

Write-Host "───────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "✅ All models successfully pulled." -ForegroundColor Green
