let destinationsCount = 2;

function addDestination() {
  destinationsCount++;
  const container = document.getElementById("destinations");

  const wrapper = document.createElement("div");

  const label = document.createElement("label");
  label.textContent = `Destino ${destinationsCount}:`;
  label.className = "block text-sm font-medium text-gray-700";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "destination";
  input.required = true;
  input.placeholder = "Ex: Rua X, São Paulo";
  input.className =
    "mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500";

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

document
  .getElementById("routeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const origin = document.getElementById("origin").value;
    const destinationInputs = document.querySelectorAll(
      "input[name='destination']"
    );
    const destinations = Array.from(destinationInputs).map(
      (input) => input.value
    );

    const loading = document.getElementById("loading");
    const resultDiv = document.getElementById("result");

    loading.classList.remove("hidden");
    resultDiv.innerHTML = "";

    try {
      const response = await fetch("http://localhost:3001/route-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destinations }),
      });

      const data = await response.json();

      if (!response.ok) {
        resultDiv.innerHTML = `<p class="text-red-600 font-medium">Erro ao calcular rota.</p>`;
        return;
      }

      resultDiv.innerHTML = `
      <h3 class="text-xl font-semibold text-blue-600 mb-2">Melhor Ordem de Visitação:</h3>
      <ol class="list-decimal list-inside space-y-1">
        ${data.rota_otimizada.map((p) => `<li>${p}</li>`).join("")}
      </ol>
      <p class="mt-4 font-medium text-gray-700">
        <strong>Distância total:</strong> ${data.distancia_total} km
      </p>
    `;

      const coords = data.coordenadas;

      if (window.routeMap) {
        window.routeMap.remove();
      }

      window.routeMap = L.map("map").setView(coords[0], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(window.routeMap);

      const latlngs = [];

      coords.forEach((coord, i) => {
        L.marker(coord)
          .addTo(window.routeMap)
          .bindPopup(`Parada ${i + 1}`);
        latlngs.push(coord);
      });

      latlngs.push(coords[0]);

      L.polyline(latlngs, { color: "blue", weight: 4 }).addTo(window.routeMap);

      setTimeout(() => {
        window.routeMap.invalidateSize();
      }, 100);

      document.getElementById("map").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      resultDiv.innerHTML = `<p class="text-red-600 font-medium">Erro ao se comunicar com a API.</p>`;
      console.error("Erro na requisição:", err);
    } finally {
      loading.classList.add("hidden");
    }
  });
