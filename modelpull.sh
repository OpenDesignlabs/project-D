#!/usr/bin/env bash
# Pulls all Ollama cloud models required for Vectra MagicBar

echo "Pulling Vectra AI Models from Ollama..."
echo "───────────────────────────────────────────────"

ollama pull nemotron-3-super:cloud
ollama pull minimax-m2.5:cloud
ollama pull deepseek-v3.1:671b-cloud
ollama pull gemini-3-flash-preview:cloud
ollama pull minimax-m2.7:cloud
ollama pull glm-5.1:cloud
ollama pull glm-5:cloud
ollama pull qwen3-coder-next:cloud

echo "───────────────────────────────────────────────"
echo "✅ All models successfully pulled."
