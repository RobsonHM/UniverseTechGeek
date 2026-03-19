// JS/review.js
let selectedRating = null;
// Não declaramos "let db" aqui para não conflitar com o window.db do database.js

// Pega os dados da URL atual
const urlPath = window.location.pathname; // Ex: /pages/gamesinfo.html
const params = new URLSearchParams(window.location.search);

// 1. Identifica a Categoria baseada no nome do arquivo HTML
let currentCategory = "geral";
if (urlPath.includes("booksinfo")) currentCategory = "livros";
if (urlPath.includes("gamesinfo")) currentCategory = "jogos";
if (urlPath.includes("movies_seriesinfo")) currentCategory = "filmes";

// 2. Identifica o ID do item
const currentItemId = params.get("id"); // Pega o '1' do ?id=1

console.log(`Página atual: Categoria = ${currentCategory}, ID = ${currentItemId}`);



// 1. FUNÇÃO PRINCIPAL: Carrega o HTML e depois os dados
async function inicializarSistemaCompleto() {
    console.log("Iniciando carregamento do sistema...");
    
    // A. Garante que o Banco de Dados está pronto
    window.db = await initDatabase();
    console.log("Banco pronto!");

    // B. Carrega o HTML do formulário de review
    const containerGlobal = document.getElementById("container-review-global");
    if (!containerGlobal) return;

    try {
        const response = await fetch('review.html');
        const html = await response.text();
        containerGlobal.innerHTML = html;
        
        // C. Após o HTML ser inserido, inicializamos os botões e verificamos o login
        inicializarBotoes();
        checkLoginStatus();

        // D. SÓ AGORA as reviews podem ser carregadas, pois o ID "reviews" já existe no DOM
        carregarReviews();
        
    } catch (error) {
        console.error("Erro ao carregar o arquivo review.html:", error);
    }
}

function carregarReviews() {
    if (!window.db || !currentItemId) return;

    try {
        // FILTRO: Só busca reviews que batem com o ID e a Categoria da página atual
        const res = window.db.exec(
            "SELECT rating, comment, author FROM reviews WHERE item_id = ? AND categoria = ? ORDER BY id DESC",
            [currentItemId, currentCategory]
        );

        const container = document.getElementById("reviews");
        if (!container) return;

        container.innerHTML = ""; 

        if (res.length > 0 && res[0].values) {
            res[0].values.forEach(row => {
                adicionarReviewNaTela(row[0], row[1], row[2]);
            });
            console.log(`Carregadas ${res[0].values.length} reviews para este item.`);
        } 
    } catch (e) {
        console.warn("Tabela de reviews ainda não filtrável ou vazia.");
    }
}

function adicionarReviewNaTela(nota, texto, user) {
    const container = document.getElementById("reviews");
    if (!container) return;

    const review = document.createElement("div");
    review.classList.add("review-card");
    review.innerHTML = `
        <div class="review-note">${nota}/10</div>
        <p class="text-white mt-4">${texto}</p>
        <p class="text-gray-400 mt-2">User: ${user}</p>
    `;
    container.prepend(review);
}

function submitReview() {
    // 1. Verificar login
    const userLoggedIn = sessionStorage.getItem("userLoggedIn");
    if (!userLoggedIn) {
        alert("You need to log in to comment.");
        window.location.href = "login.html";
        return;
    }

    // 2. Capturar os valores dos inputs (AGORA A VARIÁVEL 'text' NASCE AQUI)
    const reviewInput = document.getElementById("reviewText");
    const text = reviewInput ? reviewInput.value.trim() : "";

    // 3. Validações de preenchimento
    if (selectedRating === null || text === "") {
        alert("Select a rating and write something.");
        return;
    }

    // 4. Salvar no Banco (Uma única vez, com todas as colunas)
    if (window.db) {
        try {
            window.db.run(
                "INSERT INTO reviews (item_id, categoria, rating, comment, author) VALUES (?, ?, ?, ?, ?)", 
                [currentItemId, currentCategory, selectedRating, text, userLoggedIn]
            );
            window.db.persist();
            console.log("Review saved successfully!");
        } catch (e) {
            console.error("Error saving to the database. You might need to clear localStorage?", e);
        }
    }

    // 5. Add visually to the screen
    adicionarReviewNaTela(selectedRating, text, userLoggedIn);

    // 6. Reset the form
    selectedRating = null;
    document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
    if (reviewInput) reviewInput.value = "";
}

function inicializarBotoes() {
    const ratingContainer = document.getElementById("ratingButtons");
    if (!ratingContainer) return;

    for (let i = 0; i <= 10; i++) {
        let btn = document.createElement("button");
        btn.innerText = i;
        btn.classList.add("rating-btn");
        btn.onclick = function() {
            selectedRating = i;
            document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };
        ratingContainer.appendChild(btn);
    }
}

function checkLoginStatus() {
    const userLoggedIn = sessionStorage.getItem("userLoggedIn");
    const formReview = document.getElementById("reviewForm"); // Supondo que o form tenha esse ID dentro do review.html

    if (!userLoggedIn && formReview) {
        formReview.innerHTML = `<p class="text-white">Faça <a href="login.html" class="text-blue-400">login</a> para avaliar.</p>`;
    }
}

// ÚNICO PONTO DE ENTRADA
window.addEventListener('load', inicializarSistemaCompleto);