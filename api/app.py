import itertools

import networkx as nx
from flask import Flask, jsonify, request
from flask_cors import CORS
from geopy.geocoders import Nominatim
from haversine import haversine

app = Flask(__name__)
geolocator = Nominatim(user_agent="route-planner")

CORS(app)


@app.route("/")
def home():
    return "API de Roteirização Ativa"


@app.route("/route-planner", methods=["POST"])
def route_planner():
    data = request.get_json()

    origin = data.get("origin")
    destinations = data.get("destinations")

    if not origin or not destinations or not isinstance(destinations, list):
        return jsonify({"erro": "Origem e destinos são obrigatórios."}), 400

    # Geocodificar todos os endereços
    try:
        raw_points = [origin] + destinations
        coord_points = {}
        for point in raw_points:
            location = geolocator.geocode(point)
            if not location:
                return jsonify({"error": f"Endereço não encontrado: {point}"}), 400
            coord_points[point] = (location.latitude, location.longitude)
    except Exception as e:
        return jsonify({"error": f"Erro na geocodificação: {str(e)}"}), 500

    # Criar grafo com distâncias
    G = nx.Graph()
    for point1 in coord_points:
        for point2 in coord_points:
            if point1 != point2:
                distance = haversine(coord_points[point1], coord_points[point2])
                G.add_edge(point1, point2, weight=distance)

    # Resolver TSP: origem fixa, destinos permutados
    def calculate_total_distance(path):
        distance = 0
        for i in range(len(path) - 1):
            distance += G[path[i]][path[i + 1]]["weight"]
        distance += G[path[-1]][path[0]]["weight"]
        return distance

    best_route = []
    shortest_distance = float("inf")

    only_destinations = destinations
    for perm in itertools.permutations(only_destinations):
        path = [origin] + list(perm)
        distance = calculate_total_distance(path)
        if distance < shortest_distance:
            shortest_distance = distance
            best_route = path

    return jsonify(
        {"rota_otimizada": best_route, "distancia_total": round(shortest_distance, 2)}
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
