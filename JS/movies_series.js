// =============================
// LOAD JSON (Mantido)
// =============================
async function loadJSON() {
    const response = await fetch("../api/movies_series.json");
    const data = await response.json();
    return data;
}

// =============================
// GET URL PARAMS (Mantido)
// =============================
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: parseInt(params.get("id")),
        type: params.get("type")
    };
}

// =============================
// FIND MEDIA (Mantido)
// =============================
function findMedia(data, id, type) {
    if (type === "movie") {
        return data.movies.find(m => m.id === id);
    }
    if (type === "series") {
        return data.series.find(s => s.id === id);
    }
}

// =============================
// CREATE CARDS (LISTAGEM)
// =============================
function createMovieCard(movie) {
    return `
    <div class="hover-card cursor-pointer">
        <a href="movies_seriesinfo.html?id=${movie.id}&type=movie">
            <div class="aspect-[2/3] wireframe-box rounded-lg mb-4 relative">
                <img src="${movie.poster}" alt="${movie.title}" class="w-full h-full object-cover rounded-lg">
                <div class="textover text-xs">⭐ ${movie.rating}</div>
            </div>
            <div class="text-sm font-bold">${movie.title}</div>
            <div class="text-xs opacity-70">${movie.year}</div>
        </a>
    </div>`;
}

function createSeriesCard(serie) {
    return `
    <div class="hover-card cursor-pointer">
        <a href="movies_seriesinfo.html?id=${serie.id}&type=series">
            <div class="aspect-[2/3] wireframe-box rounded-lg mb-4 relative">
                <img src="${serie.poster}" alt="${serie.title}" class="w-full h-full object-cover rounded-lg">
                <div class="textover text-xs">${serie.seasons || 'TV'}</div>
            </div>
            <div class="text-sm font-bold">${serie.title}</div>
            <div class="text-xs opacity-70">${serie.year}</div>
        </a>
    </div>`;
}

// =============================
// RENDER MEDIA DETAILS (INFO PAGE)
// Mapeado com os campos exatos do seu JSON
// =============================
function renderMediaDetails(item) {
    if (!item) return;

    // Poster
    const posterContainer = document.getElementById("media-poster-container");
    if (posterContainer) {
        posterContainer.innerHTML = `<img src="${item.poster}" alt="${item.title}" class="w-full h-full object-cover rounded-lg shadow-2xl">`;
    }

    // Título e Diretor/Criador (Usando field 'director' do seu JSON)
    const titleElem = document.getElementById("media-title");
    const creatorElem = document.getElementById("media-creator");
    if (titleElem) titleElem.innerText = item.title;
    if (creatorElem) creatorElem.innerText = item.director || item.creator || "Diretor Desconhecido";

    // Rating (Estrela + Nota)
    const ratingElem = document.getElementById("media-rating");
    if (ratingElem) ratingElem.innerText = `⭐ ${item.rating}`;

    // Sinopse
    const synopsisElem = document.getElementById("media-synopsis");
    if (synopsisElem) synopsisElem.innerText = item.synopsis;

    // Grid de Informações
    const yearElem = document.getElementById("info-year");
    const genreElem = document.getElementById("info-genre");
    const durationElem = document.getElementById("info-duration");
    const labelDuration = document.getElementById("label-duration");
    const castElem = document.getElementById("info-cast");

    if (yearElem) yearElem.innerText = item.year;
    
    // Gênero (tratando array)
    if (genreElem) {
        genreElem.innerText = Array.isArray(item.genre) ? item.genre.join(", ") : item.genre;
    }

    // Elenco/Cast (tratando array do JSON)
    if (castElem) {
        castElem.innerText = Array.isArray(item.cast) ? item.cast.join(", ") : item.cast;
    }

    // Lógica Duração (Filmes) vs Temporadas (Séries)
    if (durationElem && labelDuration) {
        if (item.seasons) {
            labelDuration.innerText = "Temporadas";
            durationElem.innerText = `${item.seasons} Seasons`;
        } else {
            labelDuration.innerText = "Duração";
            durationElem.innerText = item.duration || "-";
        }
    }
}

// =============================
// CONTROLADORES DE CARREGAMENTO
// =============================

async function loadMediaPage() {
    const data = await loadJSON();
    const moviesGrid = document.getElementById("movies-grid");
    const seriesGrid = document.getElementById("series-grid");

    if (moviesGrid && data.movies) {
        moviesGrid.innerHTML = data.movies.map(m => createMovieCard(m)).join('');
    }
    if (seriesGrid && data.series) {
        seriesGrid.innerHTML = data.series.map(s => createSeriesCard(s)).join('');
    }
}

async function loadInfoPage() {
    const params = getParams();
    if (!params.id || !params.type) return;

    const data = await loadJSON();
    const item = findMedia(data, params.id, params.type);

    renderMediaDetails(item);
}

// =============================
// INICIALIZAÇÃO
// =============================
document.addEventListener("DOMContentLoaded", () => {
    // Se existir grid, carrega a listagem
    if (document.getElementById("movies-grid") || document.getElementById("series-grid")) {
        loadMediaPage();
    }

    // Se existirem os campos de info, carrega os detalhes
    if (document.getElementById("media-title")) {
        loadInfoPage();
    }
});

// Switch Tab (Se usar na página principal)
function switchTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + type);
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const activeSection = document.getElementById('section-' + type);
    if (activeSection) activeSection.classList.add('active');
}