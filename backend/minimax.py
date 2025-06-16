import asyncio
import chess
import chess.engine
import sys
import json
import os

async def evaluate_best_move_for_black(engine_path, fen, depth):
    try:
        # Vérifier que le fichier existe
        if not os.path.exists(engine_path):
            raise FileNotFoundError(f"Stockfish not found at {engine_path}")
        
        transport, engine = await chess.engine.popen_uci(engine_path)
        board = chess.Board(fen)

        if board.turn == chess.WHITE:
            result_white = await engine.play(board, chess.engine.Limit(depth=depth))
            board.push(result_white.move)

        result_black = await engine.play(board, chess.engine.Limit(depth=depth))
        await engine.quit()

        result_json = {
            'best_move': result_black.move.uci(),
            'evaluation': str(result_black.info.get("score")),
            'final_board_fen': board.fen()
        }
        return result_json
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

async def main():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    engine_path = os.path.join(dir_path, "stockfish-linux")  # Corrigé ici
    
    fen = sys.argv[1]
    depth = int(sys.argv[2])
    result = await evaluate_best_move_for_black(engine_path, fen, depth)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())