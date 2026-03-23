document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter o ID do livro a partir da URL (ex: bookinfo.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = parseInt(urlParams.get('id')) || 1; // Default para o ID 1

    // 2. Carregar os dados do JSON (ficheiro: books.json)
    fetch('../api/books.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar o ficheiro books.json.');
            }
            return response.json();
        })
        .then(data => {
            // 3. Encontrar o livro específico no array pelo ID
            const book = data.find(b => b.id === bookId);

            if (book) {
                renderBookDetails(book);
            } else {
                showErrorPage(
                    "Livro não encontrado!",
                    "O exemplar solicitado não existe no nosso acervo digital.",
                    "Explorar Biblioteca"
                );
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            showErrorPage(
                "Erro de Ligação",
                "Não foi possível ligar ao servidor de dados. Verifique se o ficheiro books.json está presente.",
                "Tentar Novamente"
            );
        });
});

/**
 * Função para exibir uma interface de erro amigável
 */
function showErrorPage(title, message, buttonText) {
    document.body.innerHTML = `
    <div class="container mx-auto px-4 py-20 text-center">
        <h1 class="text-3xl font-bold text-red-600">${title}</h1>
        <p class="text-gray-600 mt-4">${message}</p>
        <button onclick="window.location.href='index.html'" class="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-gray-800 transition-colors">
            ${buttonText}
        </button>
    </div>`;
}

/**
 * Função para injetar os dados no HTML da página bookinfo.html
 */
function renderBookDetails(book) {
    // Atualizar o Título da Aba utilizando as chaves do seu JSON (title)
    document.title = `${book.title} - Detalhes do Livro`;
    
    // Título, Autor e Nota (mapeados para title, author, rating)
    document.getElementById('book-title').textContent = book.title;
    document.getElementById('book-author').textContent = book.author;
    document.getElementById('book-rating').textContent = book.rating;

    // Descrição (mapeada para description)
    document.getElementById('book-short-description').textContent = book.description;
    
    // Caso a sinopse completa seja um array no futuro, mantemos a lógica, 
    // caso contrário usamos a descrição simples
    const fullSynopsis = document.getElementById('book-full-synopsis');
    if (fullSynopsis) {
        if (Array.isArray(book.sinopse_completa)) {
            fullSynopsis.innerHTML = book.sinopse_completa.map(p => `<p>${p}</p>`).join('');
        } else {
            fullSynopsis.innerHTML = `<p>${book.description}</p>`;
        }
    }

    // Tags de Género (mapeada para genre - convertendo para array caso venha como string)
    const tagsContainer = document.getElementById('genre-tags');
    if (tagsContainer && book.genre) {
        const genres = Array.isArray(book.genre) ? book.genre : [book.genre];
        tagsContainer.innerHTML = genres.map(g => 
            `<span class="bg-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-700">${g}</span>`
        ).join('');
    }

    // Informações Adicionais (Fallbacks caso o JSON não tenha estes campos ainda)
    document.getElementById('info-publisher').textContent = book.publisher || book.editora || "N/A";
    document.getElementById('info-language').textContent = book.language || book.idioma || "N/A";
    document.getElementById('info-date').textContent = book.year || book.data_publicacao || "N/A";
    document.getElementById('info-pages').textContent = book.pages || book.paginas || "N/A";

    // Especificações Técnicas
    if (book.especificacoes) {
        document.getElementById('spec-isbn').textContent = book.especificacoes.isbn || "-";
        document.getElementById('spec-dimensions').textContent = book.especificacoes.dimensoes || "-";
        document.getElementById('spec-format').textContent = book.especificacoes.formato || "-";
        document.getElementById('spec-weight').textContent = book.especificacoes.peso || "-";
    }

    // Imagem da Capa (mapeada para cover)
    if (book.cover) {
        const coverContainer = document.getElementById('book-cover-container');
        if (coverContainer) {
            coverContainer.innerHTML = `<img src="${book.cover}" alt="${book.title}" class="w-full h-full book-cover-detail2">`;
        }
    }
}
