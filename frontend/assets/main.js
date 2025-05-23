const fixedDestinationBlock = 2;

function addDestination() {
  const container = document.getElementById("destinations");

  const wrapper = document.createElement("div");
  wrapper.className = "relative group border rounded-md p-2 pb-4";

  const label = document.createElement("label");
  label.className = "block text-sm font-medium text-gray-700 destination-label";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "destination";
  input.required = true;
  input.placeholder = "Ex: Rua X, São Paulo";
  input.className =
    "mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className =
    "absolute top-2 right-2 text-red-500 hover:text-red-700 transition";
  removeBtn.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5"></i>`;
  removeBtn.onclick = () => {
    wrapper.remove();
    updateDestinationCount();
  };

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  wrapper.appendChild(removeBtn);

  container.appendChild(wrapper);

  updateDestinationCount();
  lucide.createIcons();
}

function updateDestinationCount() {
  const labels = document.querySelectorAll(".destination-label");
  labels.forEach((label, index) => {
    label.textContent = `Destino ${fixedDestinationBlock + (index + 1)}:`;
  });
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
        if (response.status === 422) {
          showToast(
            "Distância total muito alta. Reduza os destinos e tente novamente.",
            "error"
          );
        } else if (response.status === 400) {
          showToast(
            "Endereço inválido ou não localizado. Verifique os dados.",
            "error"
          );
        } else {
          showToast("Erro ao calcular rota. Tente novamente.", "error");
        }
        return;
      }

      const coords = data.coordenadas;

      if (window.routeMap) {
        window.routeMap.remove();
      }

      window.routeMap = L.map("map").setView(coords[0], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(window.routeMap);

      coords.forEach((coord, i) => {
        L.marker(coord)
          .addTo(window.routeMap)
          .bindPopup(`Parada ${i + 1}`);
      });

      await drawRealRouteByRoads(coords, window.routeMap);

      window.routeMap.whenReady(() => {
        setTimeout(() => {
          window.routeMap.invalidateSize();
        }, 100);
      });

      resultDiv.innerHTML = `
      <h3 class="text-xl font-semibold text-blue-600 mb-2">Melhor Ordem de Visitação:</h3>
      <ol class="list-decimal list-inside space-y-1">
        ${data.rota_otimizada.map((p) => `<li>${p}</li>`).join("")}
      </ol>
      <p class="mt-4 font-medium text-gray-700">
        <strong>Distância total:</strong> ${data.distancia_total} km
      </p>
    `;

      const mapContainer = document.getElementById("map");

      mapContainer.classList.remove("hidden");

      mapContainer.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      resultDiv.innerHTML = `<p class="text-red-600 font-medium">Erro ao se comunicar com a API.</p>`;
      console.error("Erro na requisição:", err);
    } finally {
      loading.classList.add("hidden");
    }
  });

async function drawRealRouteByRoads(coords, mapInstance) {
  const coordinates = coords.map(([lat, lon]) => [lon, lat]);

  const response = await fetch("http://localhost:3001/ors-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coordinates }),
  });

  if (!response.ok) {
    showToast("Erro ao tentar buscar rota real. Tente novamente.", "error");
    return;
  }

  const data = await response.json();

  L.geoJSON(data, {
    style: {
      color: "blue",
      weight: 4,
    },
  }).addTo(mapInstance);
}

function showToast(message, icon = "success") {
  Swal.fire({
    toast: true,
    position: "top",
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.style.fontSize = "16px";
      toast.style.minWidth = "auto";
      toast.style.padding = "8px 12px";
    },
  });
}
