#!/bin/bash
echo "Starting Ngrok tunnel for Ollama on port 11434..."
ngrok http 11434 --host-header="localhost:11434"
