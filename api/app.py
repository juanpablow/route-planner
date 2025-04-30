from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "API de Roteirização Ativa"


@app.route("/route-planner", methods=["POST"])
def route_planner():
    return "Route planner POST test"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
