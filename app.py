from flask import Flask, render_template, request, jsonify, make_response
import uuid
import numpy as np


MAX_H = 4200000


class GomokuBot:
    def __init__(self, simbol="2"):
        self.simbol = simbol

    def flip(self, c):
        return "1" if c == "2" else "2"

    def process_line(self, line, field, simbol, target_len=5):
        k = 0.5
        h_general = 0
        h_local = 0
        len_line = 0
        collected_detail_dist = 0

        for f, s in line:
            if field[f][s] == "-":
                len_line += 1
                collected_detail_dist = 0
            elif field[f][s] == simbol:
                collected_detail_dist += 1
                h_local += collected_detail_dist**3
                h_local += (
                    (7.0 - abs(8 - (f + 1))) / 7.0 + (7.0 - abs(8 - (s + 1))) / 7.0
                ) * k
                len_line += 1
                if collected_detail_dist >= target_len:
                    return MAX_H
            else:
                collected_detail_dist = 0
                if len_line >= target_len:
                    h_general += h_local
                h_local = 0
                len_line = 0
            if len_line >= target_len:
                h_general += h_local
        return h_general

    def total_heuristic_one_player(self, field, simbol, target_len=5):
        h = 0
        field_size = len(field)
        for i in range(field_size):
            horizontal = [(i, col) for col in range(field_size)]
            h += self.process_line(horizontal, field, simbol, target_len)
        for j in range(field_size):
            vertical = [(row, j) for row in range(field_size)]
            h += self.process_line(vertical, field, simbol, target_len)

        for i in range(field_size):
            main_diagonal = [(i + k, k) for k in range(field_size - i)]
            h += self.process_line(main_diagonal, field, simbol, target_len)
        for j in range(1, field_size):
            main_diagonal = [(k, j + k) for k in range(field_size - j)]
            h += self.process_line(main_diagonal, field, simbol, target_len)
        for i in range(field_size):
            secondary_diagonal = [
                (i + k, field_size - 1 - k) for k in range(field_size - i)
            ]
            h += self.process_line(secondary_diagonal, field, simbol, target_len)
        for j in range(field_size - 2, -1, -1):
            secondary_diagonal = [(k, j - k) for k in range(j + 1)]
            h += self.process_line(secondary_diagonal, field, simbol, target_len)

        return h

    def total_heuristic(self, field, simbol, target_len=5):
        return (
            self.total_heuristic_one_player(field, simbol, target_len)
            - self.total_heuristic_one_player(field, self.flip(simbol), target_len) * 3
        )

    def next_step_best_h(self, field, target_len=5):
        best_i, best_j = 0, 0
        best_h = -float("inf")
        field_size = len(field)
        for i in range(field_size):
            for j in range(field_size):
                if field[i][j] == "-":
                    field[i][j] = self.simbol
                    h = self.total_heuristic(field, self.simbol, target_len=target_len)
                    field[i][j] = "-"
                    if h > best_h:
                        best_h = h
                        best_i, best_j = i, j
        return best_i, best_j


gb = GomokuBot()
app = Flask(__name__)


@app.route("/")
def index():

    return render_template("index.html")


@app.route("/settings")
def settings():
    return render_template("settings.html")


@app.route("/game", methods=["GET", "POST"])
def game():
    if request.method == "POST":
        data = request.json
        field_size = data.get("fieldSize")
        target_length = data.get("targetLength")

        if field_size is None:
            field_size = 15
        if target_length is None:
            target_length = 5
        response = make_response(jsonify({"status": "success"}))
        return response
    else:
        field_size = request.cookies.get("field_size", default=15)
        field_size = int(field_size)
        target_length = request.cookies.get(
            "target_length",
            default=5,
        )
        target_length = int(target_length)
        return render_template(
            "game.html",
        )


@app.route("/getCookies", methods=["POST"])
def get_cookies():
    data = request.json
    print(data)
    return jsonify(
        {
            "status": "success",
            "message": "Cookies received",
        }
    )


@app.route("/updateGame", methods=["POST"])
def update_game():
    data = request.json
    grid = data.get("grid")
    target_len = data.get("targetLength")
    print(target_len)
    x, y = gb.next_step_best_h(field=grid, target_len=target_len)
    grid[x][y] = "2"

    return jsonify(grid)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
