// JS/review.js
let selectedRating = null;
// Não declaramos "let db" aqui para não conflitar com o window.db do database.js

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
    if (!window.db) return;

    try {
        const res = window.db.exec("SELECT rating, comment, author FROM reviews ORDER BY id DESC");
        const container = document.getElementById("reviews");

        if (!container) {
            console.warn("Aguardando container de reviews...");
            return;
        }

        container.innerHTML = ""; // Limpa o container

        if (res.length > 0) {
            res[0].values.forEach(row => {
                adicionarReviewNaTela(row[0], row[1], row[2]);
            });
            console.log("Reviews renderizadas!");
        }
    } catch (e) {
        console.log("Nenhuma review encontrada no banco.");
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
    const userLoggedIn = sessionStorage.getItem("userLoggedIn");
    if (!userLoggedIn) {
        alert("Faça login para comentar.");
        return;
    }

    const text = document.getElementById("reviewText").value.trim();
    if (selectedRating === null || text === "") {
        alert("Selecione uma nota e escreva algo.");
        return;
    }

    // Adiciona na tela e salva no banco
    adicionarReviewNaTela(selectedRating, text, userLoggedIn);

    if (window.db) {
        window.db.run("INSERT INTO reviews (rating, comment, author) VALUES (?, ?, ?)", [selectedRating, text, userLoggedIn]);
        window.db.persist();
    }

    // Reset
    selectedRating = null;
    document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("reviewText").value = "";
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