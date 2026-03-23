
document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter o ID do jogo a partir da URL (ex: gamesinfo.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = parseInt(urlParams.get('id')) || null;

    // 2. Carregar os dados do JSON (agora games.json)
    fetch('../api/games.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar o ficheiro games.json.');
            }
            return response.json();
        })
        .then(data => {
            // Preencher o dropdown
            const select = document.getElementById('game-select');
            if (select) {
                data.forEach(game => {
                    const option = document.createElement('option');
                    option.value = game.id;
                    option.textContent = game.titulo;
                    select.appendChild(option);
                });
                // Selecionar o jogo atual
                if (gameId) select.value = gameId;
                select.addEventListener('change', function() {
                    if (select.value) {
                        window.location.href = `gamesinfo.html?id=${select.value}`;
                    }
                });
            }
            // 3. Encontrar o jogo específico no array
            const game = data.find(g => g.id === gameId) || data[0];
            if (game) {
                renderGameDetails(game);
            } else {
                // Caso o ID não exista no JSON
                showErrorPage(
                    "Jogo não encontrado!",
                    "O ID solicitado não existe na nossa base de dados.",
                    "Voltar para a Home"
                );
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            // Exibe mensagem de erro amigável se o JSON falhar
            showErrorPage(
                "Erro de Ligação",
                "Não foi possível carregar o ficheiro de dados (games.json). Verifique se o ficheiro existe no servidor.",
                "Tentar Novamente"
            );
        });
});

/**
 * Função para exibir uma interface de erro limpa
 */
function showErrorPage(title, message, buttonText) {
    document.body.innerHTML = `
    <div class="container mx-auto px-4 py-20 text-center">
        <h1 class="text-3xl font-bold text-red-600">${title}</h1>
        <p class="text-gray-600 mt-4">${message}</p>
        <button onclick="window.location.reload()" class="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-gray-800">
            ${buttonText}
        </button>
        <a href="index.html" class="block mt-4 text-blue-600 underline">Voltar à página inicial</a>
    </div>`;
}

/**
 * Função para injetar os dados no HTML da página gamesinfo.html
 */
function renderGameDetails(game) {
    // Atualizar o Título da Página e Elementos de Texto Principal
    document.title = `${game.titulo} - Informação do Jogo`;
    
    const titleElement = document.querySelector('h1');
    const ratingElement = document.getElementById('game-rating');
    
    if (titleElement) titleElement.textContent = game.titulo;
    if (ratingElement) ratingElement.textContent = game.nota;

    // Sinopse
    const sinopseContainer = document.querySelector('section .max-w-3xl');
    if (sinopseContainer) {
        sinopseContainer.innerHTML = `<p>${game.sinopse}</p>`;
    }

    // Tags/Categorias
    const tagsContainer = document.getElementById('tags-container');
    if (tagsContainer) {
        tagsContainer.innerHTML = game.tags.map(tag => 
            `<span class="bg-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase">${tag}</span>`
        ).join('');
    }

    // Informações Técnicas (Desenvolvedora, Editora, Lançamento, Plataformas)
    const infoItems = document.querySelectorAll('.info-grid-item span:last-child');
    if (infoItems.length >= 4) {
        infoItems[0].textContent = game.desenvolvedora;
        infoItems[1].textContent = game.editora;
        infoItems[2].textContent = game.lancamento;
        infoItems[3].textContent = game.plataformas;
    }

    // Requisitos Mínimos
    const minReqs = document.querySelectorAll('.requirement-card:first-of-type li');
    if (minReqs.length >= 5) {
        minReqs[0].innerHTML = `<strong>SO:</strong> ${game.requisitos.minimos.so}`;
        minReqs[1].innerHTML = `<strong>Processador:</strong> ${game.requisitos.minimos.cpu}`;
        minReqs[2].innerHTML = `<strong>Memória:</strong> ${game.requisitos.minimos.ram}`;
        minReqs[3].innerHTML = `<strong>Placa Gráfica:</strong> ${game.requisitos.minimos.gpu}`;
        minReqs[4].innerHTML = `<strong>Espaço:</strong> ${game.requisitos.minimos.armazenamento}`;
    }

    // Requisitos Recomendados
    const recReqs = document.querySelectorAll('.requirement-card:last-of-type li');
    if (recReqs.length >= 5) {
        recReqs[0].innerHTML = `<strong>SO:</strong> ${game.requisitos.recomendados.so}`;
        recReqs[1].innerHTML = `<strong>Processador:</strong> ${game.requisitos.recomendados.cpu}`;
        recReqs[2].innerHTML = `<strong>Memória:</strong> ${game.requisitos.recomendados.ram}`;
        recReqs[3].innerHTML = `<strong>Placa Gráfica:</strong> ${game.requisitos.recomendados.gpu}`;
        recReqs[4].innerHTML = `<strong>Espaço:</strong> ${game.requisitos.recomendados.armazenamento}`;
    }
	

		// ... (seu código anterior de títulos, tags e requisitos)

    const galleryContainer = document.getElementById('game-gallery');

	if (galleryContainer && game.screenshots && game.screenshots.length > 0) {
		galleryContainer.innerHTML = `
			<div class="lg:col-span-8 w-full">
				<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; align-items: start;">
					
					<div style="grid-column: span 3; position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 16px; background: #1a1a1a;">
						<img src="${game.screenshots[0]}" 
							alt="${game.titulo}" 
							id="main-photo"
							style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; display: block;">
					</div>
					
					<div style="display: flex; flex-direction: column; gap: 16px; height: 100%;">
						${game.screenshots.slice(1, 4).map((src, index) => `
							<div style="flex: 1; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 8px; background: #1a1a1a; cursor: pointer;">
								<img src="${src}" 
									alt="Screenshot ${index + 2}" 
									style="width: 100%; height: 100%; object-fit: cover; transition: all 0.3s ease;"
									onclick="swapImages(this)">
							</div>
						`).join('')}
					</div>

				</div>
			</div>
		`;
	}


	
}

function swapImages(el) {
    const mainPhoto = document.getElementById('main-photo');
    
    // 1. Guardamos o endereço da imagem que está no meio AGORA
    const oldMainSrc = mainPhoto.src;
    
    // 2. Pegamos o endereço da miniatura que foi clicada
    const newMainSrc = el.src;

    // 3. Efeito visual de transição
    mainPhoto.style.opacity = '0';
    
    setTimeout(() => {
        // 4. A principal recebe a imagem da miniatura
        mainPhoto.src = newMainSrc;
        
        // 5. A miniatura recebe a imagem que estava no meio (A troca real!)
        el.src = oldMainSrc;
        
        mainPhoto.style.opacity = '1';
    }, 150);
}