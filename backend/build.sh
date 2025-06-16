#!/bin/bash
pip install -r requirements.txt
curl -L -o stockfish-linux https://github.com/Elixyrrr/chesspro/releases/download/v1.0.0/stockfish-ubuntu-x86-64-avx2
chmod +x stockfish-linux
echo "Stockfish downloaded successfully"
ls -la stockfish-linux