document.addEventListener("DOMContentLoaded", () => {
    // Se estivermos na página de listagem
    if (document.getElementById("music-grid")) {
        loadMusicList();
    }
    
    // Se estivermos na página de detalhes
    if (document.getElementById("album-details-container")) {
        loadAlbumDetails();
    }
});

// --- FUNÇÕES PARA A LISTAGEM ---
async function loadMusicList() {
    try {
        const response = await fetch("../api/music.json");
        const data = await response.json();
        const grid = document.getElementById("music-grid");
        
        grid.innerHTML = data.albums.map(album => `
            <div class="hover-card cursor-pointer group" onclick="goToDetails(${album.id})">
                <div class="aspect-square wireframe-box rounded-lg mb-4 overflow-hidden bg-zinc-900">
                    <img src="${album.cover}" class="w-full h-full object-cover transition-transform group-hover:scale-105">
                </div>
                <h4 class="text-sm font-bold">${album.title}</h4>
                <p class="text-xs text-blue-600 font-bold">${album.artist}</p>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

function goToDetails(id) {
    window.location.href = `musicinfo.html?id=${id}`;
}

// --- FUNÇÕES PARA OS DETALHES ---
async function loadAlbumDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    try {
        const response = await fetch("../api/music.json");
        const data = await response.json();
        const album = data.albums.find(a => a.id === id);

        if (!album) return;

        document.getElementById("album-details-container").innerHTML = `
            <div class="grid md:grid-cols-3 gap-12">
                <div class="md:col-span-1">
                    <div class="aspect-square rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                        <img src="${album.cover}" class="w-24 h-24 object-cover">
                    </div>
                    <div class="mt-6 flex items-center justify-between px-2">
                        <span class="text-2xl font-bold text-blue-600">⭐ ${album.rating}</span>
                        <span class="text-gray-400 font-mono">${album.year}</span>
                    </div>
                </div>

                <div class="md:col-span-2 space-y-6">
                    <div>
                        <h1 class="text-5xl font-black uppercase tracking-tighter">${album.title}</h1>
                        <p class="text-2xl font-bold text-blue-600">${album.artist}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 class="text-xs font-bold uppercase text-gray-400 mb-2">Sobre o Álbum</h3>
                        <p class="leading-relaxed text-gray-700">${album.description}</p>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-xl font-bold uppercase">Tracklist</h3>
                        <div class="divide-y divide-gray-100">
                            ${album.tracks.map((track, index) => `
                                <div class="py-3 flex items-center gap-4 hover:bg-blue-50 transition px-2 rounded-lg cursor-default">
                                    <span class="text-gray-300 font-mono text-sm">${(index + 1).toString().padStart(2, '0')}</span>
                                    <span class="font-medium text-gray-800">${track}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get('id');

    if (albumId) {
        loadAlbumDetails(albumId);
    }
});

async function loadAlbumDetails(id) {
    try {
        const response = await fetch("../api/music.json");
        const data = await response.json();
        const album = data.albums.find(a => a.id == id);

        if (album) {
            // Preencher Imagem
            document.getElementById('album-cover-container').innerHTML = 
                `<img src="${album.cover}" alt="${album.title}" class="w-full h-full object-cover rounded-xl ">`;
            
            // Preencher Textos Principais
            document.getElementById('album-title').innerText = album.title;
            document.getElementById('album-artist').innerText = album.artist;
            document.getElementById('album-rating').innerText = album.rating;
            document.getElementById('album-description').innerText = album.description;

            // Preencher Grid de Info
            document.getElementById('info-year').innerText = album.year;
            document.getElementById('info-genre').innerText = album.genre;
            document.getElementById('info-label').innerText = album.label || "N/A";

            // Preencher Tracks
            const tracksContainer = document.getElementById('info-tracks');

            tracksContainer.innerHTML = album.tracks.map((t, index) => {
                // Vamos usar 25 caracteres para garantir que caiba em qualquer tela
                const maxChars = 50;
                const treatedName = t.length > maxChars ? t.substring(0, maxChars) + "..." : t;
                return `
                <div class="text-sm border-b border-gray-200 py-2 font-medium flex items-center">
                    <span class="text-blue-600 font-bold w-8 flex-shrink-0">${index + 1}.</span> 
                    
                    <span class="text-white truncate flex-1" style="min-width: 0;" title="${t}">
                        ${treatedName}
                    </span>
                </div>`;
            }).join('');
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}