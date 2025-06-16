import asyncio
import chess
import chess.engine
import sys
import json
import os
async def evaluate_best_move_for_black(engine_path, fen, depth):
    # Load the Stockfish chess engine
    transport, engine = await chess.engine.popen_uci(engine_path)
    board = chess.Board(fen)

    # If it's white's turn to move, play the best move for white
    if board.turn == chess.WHITE:
        result_white = await engine.play(board, chess.engine.Limit(depth=depth))
        board.push(result_white.move)

    # Now it's black's turn, request the best move for black
    result_black = await engine.play(board, chess.engine.Limit(depth=depth))

    # Properly close the engine
    await engine.quit()

    # Return the result in JSON format
    result_json = {
        'best_move': result_black.move.uci(),
        'evaluation': str(result_black.info.get("score")),
        'final_board_fen': board.fen()
    }
    return result_json

async def main():

# Si votre fichier est dans le même dossier que votre script Python
    dir_path = os.path.dirname(os.path.realpath(__file__))
    engine_path = os.path.join(dir_path, "stockfish-windows-x86-64-avx2.exe")

    fen = sys.argv[1]  # FEN passed as the first command-line argument
    depth = int(sys.argv[2])  # Depth passed as the second command-line argument
    result = await evaluate_best_move_for_black(engine_path, fen, depth)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
