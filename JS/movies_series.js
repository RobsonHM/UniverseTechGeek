// =============================
// LOAD JSON
// =============================

async function loadJSON() {

    const response = await fetch("../data/movies.json");
    const data = await response.json();

    return data;

}


// =============================
// CREATE MOVIE CARD
// =============================

function createMovieCard(movie) {

    return `
    <div class="hover-card cursor-pointer">

        <a href="movies_seriesinfo.html?id=${movie.id}&type=movie">

            <div class="aspect-[2/3] wireframe-box rounded-lg mb-4 relative">

                <img 
                    src="${movie.poster}" 
                    alt="${movie.title}"
                    class="w-full h-full object-cover rounded-lg"
                >

                <div class="textover text-xs">
                    ⭐ ${movie.rating}
                </div>

            </div>

            <div class="text-sm font-bold">
                ${movie.title}
            </div>

            <div class="text-xs opacity-70">
                ${movie.year}
            </div>

        </a>

    </div>
    `;

}


// =============================
// CREATE SERIES CARD
// =============================

function createSeriesCard(serie) {

    return `
    <div class="hover-card cursor-pointer">

        <a href="movies_seriesinfo.html?id=${serie.id}&type=series">

            <div class="aspect-[2/3] wireframe-box rounded-lg mb-4 relative">

                <img 
                    src="${serie.poster}" 
                    alt="${serie.title}"
                    class="w-full h-full object-cover rounded-lg"
                >

                <div class="textover text-xs">
                    ${serie.seasons} SEASONS
                </div>

            </div>

            <div class="text-sm font-bold">
                ${serie.title}
            </div>

            <div class="text-xs opacity-70">
                ${serie.year}
            </div>

        </a>

    </div>
    `;

}


// =============================
// RENDER MOVIES
// =============================

function renderMovies(movies) {

    const moviesGrid = document.getElementById("movies-grid");

    if (!moviesGrid) return;

    moviesGrid.innerHTML = "";

    movies.forEach(movie => {

        moviesGrid.innerHTML += createMovieCard(movie);

    });

}


// =============================
// RENDER SERIES
// =============================

function renderSeries(series) {

    const seriesGrid = document.getElementById("series-grid");

    if (!seriesGrid) return;

    seriesGrid.innerHTML = "";

    series.forEach(serie => {

        seriesGrid.innerHTML += createSeriesCard(serie);

    });

}


// =============================
// LOAD MEDIA PAGE
// =============================

async function loadMediaPage() {

    const data = await loadJSON();

    renderMovies(data.movies);
    renderSeries(data.series);

}


// =============================
// GET URL PARAMS
// =============================

function getParams() {

    const params = new URLSearchParams(window.location.search);

    return {
        id: parseInt(params.get("id")),
        type: params.get("type")
    };

}


// =============================
// FIND MEDIA
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
// RENDER MEDIA DETAILS
// =============================

function renderMediaDetails(item) {

    const container = document.getElementById("media-info");

    if (!container || !item) return;

    container.innerHTML = `

    <div class="media-details">

        <img src="${item.poster}" style="width:250px">

        <h1>${item.title}</h1>

        <p><b>Year:</b> ${item.year}</p>

        <p><b>Rating:</b> ${item.rating}</p>

        <p><b>Genre:</b> ${item.genre.join(", ")}</p>

        ${item.duration ? `<p><b>Duration:</b> ${item.duration}</p>` : ""}

        ${item.seasons ? `<p><b>Seasons:</b> ${item.seasons}</p>` : ""}

        ${item.director ? `<p><b>Director:</b> ${item.director}</p>` : ""}

        ${item.creator ? `<p><b>Creator:</b> ${item.creator}</p>` : ""}

        <p><b>Cast:</b> ${item.cast.join(", ")}</p>

        <p style="margin-top:20px">
        ${item.synopsis}
        </p>

    </div>

    `;

}


// =============================
// LOAD INFO PAGE
// =============================

async function loadInfoPage() {

    const params = getParams();

    if (!params.id) return;

    const data = await loadJSON();

    const item = findMedia(data, params.id, params.type);

    renderMediaDetails(item);

}


// =============================
// START
// =============================

document.addEventListener("DOMContentLoaded", () => {

    loadMediaPage();
    loadInfoPage();

});

loadMedia();

function switchTab(type) {
            // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');

    // Atualizar conteúdo
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('section-' + type).classList.add('active');
}