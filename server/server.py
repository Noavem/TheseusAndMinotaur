import json
import os
import random
import re

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

highscores = {}

# ============================================================
# ===== LEVEL ROUTING ========================================
# ============================================================

@app.route('/levels')
def fetch_levels():
    level_amount = count_levels()
    response = {"aantal_levels": level_amount}
    return jsonify(response)


@app.route('/level/<int:level>')
def fetch_level(level: int):
    if level > count_levels():
        response = {"error": f"Puzzle {level} doesn't exist."}
        return make_response(response, 404)

    with open(f"./levels/level{level}.json") as f:
        data = json.load(f)
    response = {"level": level,
                "game": data,
                "highscore": highscores.get(level, -1)}

    return make_response(jsonify(response), 200)


@app.route('/random_level')
def fetch_random_level():
    return fetch_level(random.randint(1, count_levels()))


# ============================================================
# ===== HIGHSCORE ROUTING ====================================
# ============================================================

@app.route('/highscore/<int:level>', methods=['POST'])
def update_highscore(level: int):
    data = request.json
    highscore = data.get('highscore')

    if level not in highscores or highscores[level] > highscore:
        old = highscores.get(level, -1)
        highscores[level] = highscore
        response = {"status": f"Highscore successfully changed from {old} to {highscore}."}
        return make_response(response, 200)
    return make_response(jsonify({}), 304)


# ============================================================
# ===== UTILITY FUNCTIONS ====================================
# ============================================================

def count_levels():
    level_json_files = [file for file in os.listdir('./levels') if re.match(r'level[0-9]+\.json$', file)]
    return len(level_json_files)


if __name__ == '__main__':
    app.run(port=5000)
