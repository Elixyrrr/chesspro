#!/bin/bash
set -e

echo "=== Installing Node.js dependencies ==="
npm install

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Downloading Stockfish from your release ==="
curl -L -o stockfish.tar https://github.com/Elixyrrr/chesspro/releases/download/v1.0.0/stockfish-ubuntu-x86-64-avx2.tar

echo "=== Extracting Stockfish ==="
tar -xf stockfish.tar
# Trouve le fichier exécutable dans l'archive
find . -name "stockfish*" -type f -executable
# Renomme-le en stockfish-linux
mv stockfish*/stockfish* stockfish-linux || mv stockfish-* stockfish-linux
chmod +x stockfish-linux

echo "=== Cleaning up ==="
rm stockfish.tar

echo "=== Verifying Stockfish ==="
ls -la stockfish-linux
./stockfish-linux --help | head -5 || echo "Stockfish is ready"

echo "=== Build completed ==="