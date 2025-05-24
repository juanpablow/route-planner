# 📦 Route Planner – Projeto Acadêmico de Roteirização com Modelagem Matemática

Este projeto foi desenvolvido como parte de um trabalho de faculdade, com o objetivo de aplicar técnicas de **modelagem matemática** e **pesquisa operacional** para solucionar um problema real de **roteirização de entregas**, utilizando conceitos de **grafos**, **algoritmos de otimização**, e ferramentas computacionais com **Python + Flask** no back-end e **HTML/CSS/JS + Leaflet** no front-end.

---

## 🚀 Tecnologias utilizadas

- **Back-end:** Python, Flask, NetworkX, Haversine, Geopy, Flask-CORS
- **Front-end:** HTML, TailwindCSS, JavaScript (puro), Leaflet
- **APIs externas:** OpenCage Geocoder, OpenRouteService
- **Deploy:** AWS Lambda (via Zappa), AWS S3 (front-end), ou Vercel (alternativa)
- **Visualização de mapa:** OpenStreetMap via Leaflet.js

---

## 🔧 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/juanpablow/route-planner.git
cd route-planner
```

---

### 2. Crie e ative um ambiente virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

---

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

---

### 4. Configure as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz da pasta `api/` (ou do projeto) com o seguinte conteúdo:

```env
OPEN_CAGE_API_KEY=SuaChaveDaOpenCage
ORS_API_KEY=SuaChaveDaOpenRouteService
FRONTEND_URL=http://localhost:3000
```

#### 🔑 Para obter as chaves:

- 🔍 **OpenCage:** https://opencagedata.com/api
- 🚗 **OpenRouteService:** https://openrouteservice.org/dev/#/signup

---

### 5. Inicie a API Flask

```bash
python app.py
```

Ela será iniciada em `http://localhost:5000`.

---

### 6. Configure o Front-end

- Abra o arquivo `frontend/assets/main.js`
- Localize a linha do `fetch` que envia a requisição para a API:

```js
fetch("http://localhost:5000/route-planner", ...)
```

> ✅ Altere essa URL se estiver rodando a API em um servidor (ex: na AWS Lambda com domínio próprio, use `https://api.seudominio.com/route-planner`).

---

### 7. Acesse o Front-end

- Se estiver rodando local, abra `frontend/index.html` com Live Server ou um servidor local.
- Se estiver hospedando na Vercel ou S3, publique os arquivos estáticos e certifique-se de atualizar o `fetch()` com o domínio correto da API.

---

## 🌍 Funcionalidades

- Inserção dinâmica de ponto de origem e múltiplos destinos
- Cálculo da melhor ordem de visitação com base em distância
- Visualização interativa da rota no mapa (via Leaflet)
- Simulação de rota real com OpenRouteService
- Identificação de erros como endereços inválidos ou rotas muito longas (com tratamento visual via Swal)

---

## 📘 Sobre o Projeto

Este projeto foi desenvolvido como parte da disciplina de **Pesquisa Operacional** e **Modelagem Matemática**, aplicando conhecimentos de:

- Geometria Analítica
- Álgebra Linear
- Matemática Discreta
- Fundamentos de Cálculo
- Estruturas de Grafos

---

## 📌 Observações

- O uso da API do OpenRouteService no plano gratuito possui limite de distância (~6.000 km por requisição). Roteiros muito longos retornarão erro.
- A chave da OpenCage pode ter limite diário. Use com moderação durante os testes.

---

## 👨‍💻 Autor

Projeto acadêmico criado por **Juan Pablo**  
Email: juanpablosmdev@gmail.com  
LinkedIn: https://linkedin.com/in/juanpablow

---

## 📝 Licença

Este projeto é livre para fins educacionais. Para uso comercial, revise os termos das APIs externas utilizadas.