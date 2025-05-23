import itertools
import os

import networkx as nx
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from geopy.geocoders import OpenCage
from haversine import haversine

load_dotenv()

OPEN_CAGE_API_KEY = os.getenv("OPEN_CAGE_API_KEY")
ORS_API_KEY = os.getenv("ORS_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")
MAX_DESTINATIONS_EXACT = 6

app = Flask(__name__)
geolocator = OpenCage(api_key=OPEN_CAGE_API_KEY)

CORS(app, origins=[FRONTEND_URL])


@app.route("/")
def home():
    return "API de Roteirização Ativa"


@app.route("/route-planner", methods=["POST"])
def route_planner():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Nenhum dado recebido"}), 400

    origin = data.get("origin")
    destinations = data.get("destinations")

    if not origin or not destinations or not isinstance(destinations, list):
        return jsonify({"error": "Origem e destinos são obrigatórios."}), 400

    try:
        raw_points = [origin] + destinations
        coord_points = {}
        for point in raw_points:
            location = geolocator.geocode(point)
            if not location:
                return jsonify({"error": f"Address not found: {point}"}), 400
            coord_points[point] = (location.latitude, location.longitude)
    except Exception as e:
        return jsonify({"error": f"Erro na geocodificação: {str(e)}"}), 500

    G = nx.Graph()
    for point1 in coord_points:
        for point2 in coord_points:
            if point1 != point2:
                distance = haversine(coord_points[point1], coord_points[point2])
                G.add_edge(point1, point2, weight=distance)

    def calculate_total_distance(path):
        distance = 0
        for i in range(len(path) - 1):
            distance += G[path[i]][path[i + 1]]["weight"]
        distance += G[path[-1]][path[0]]["weight"]
        return distance

    def nearest_neighbor(origin, destinations, coord_points):
        unvisited = set(destinations)
        path = [origin]
        current = origin

        while unvisited:
            nearest = min(
                unvisited,
                key=lambda point: haversine(coord_points[current], coord_points[point]),
            )
            path.append(nearest)
            unvisited.remove(nearest)
            current = nearest

        return path

    if len(destinations) <= MAX_DESTINATIONS_EXACT:
        best_route = []
        shortest_distance = float("inf")

        for perm in itertools.permutations(destinations):
            path = [origin] + list(perm)
            distance = calculate_total_distance(path)
            if distance < shortest_distance:
                shortest_distance = distance
                best_route = path
    else:
        best_route = nearest_neighbor(origin, destinations, coord_points)
        shortest_distance = calculate_total_distance(best_route)

    return jsonify(
        {
            "rota_otimizada": best_route,
            "distancia_total": round(shortest_distance, 2),
            "coordenadas": [coord_points[p] for p in best_route],
        }
    )


@app.route("/ors-route", methods=["POST"])
def ors_route():
    data = request.get_json()
    coordinates = data.get("coordinates")

    if not coordinates:
        return jsonify({"erro": "Coordenadas não fornecidas"}), 400

    body = {"coordinates": coordinates, "format": "geojson"}

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }

    ors_url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    response = requests.post(ors_url, json=body, headers=headers)

    if response.status_code != 200:
        return jsonify(
            {"erro": "Falha na OpenRouteService", "status": response.status_code}
        ), response.status_code

    return jsonify(response.json())


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
