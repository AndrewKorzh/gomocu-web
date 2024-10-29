from flask import Flask, render_template, request, jsonify, make_response
import uuid

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
    changed_cell = data.get("changedCell")
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            if grid[i][j] == "-":
                grid[i][j] = "2"
                return jsonify(grid)

    return jsonify(grid)


@app.route("/click", methods=["POST"])
def handle_click():
    data = request.json
    x = data.get("x")
    y = data.get("y")
    user_id = request.cookies.get("user_id")
    print(f"Пользователь {user_id} кликнул по координатам: ({x}, {y})")

    return jsonify(
        {
            "status": "success",
            "message": "Click received",
            "user_id": user_id,
            "point": f"{x}-{y}",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
