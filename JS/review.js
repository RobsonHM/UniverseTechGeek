let selectedRating = null;

// Pega os dados da URL atual
const urlPath = window.location.pathname;
const params = new URLSearchParams(window.location.search);

let currentCategory = "geral";
if (urlPath.includes("booksinfo")) currentCategory = "livros";
if (urlPath.includes("gamesinfo")) currentCategory = "jogos";
if (urlPath.includes("movies_seriesinfo")) currentCategory = "filmes";
if (urlPath.includes("musicinfo")) currentCategory = "musica";

const currentItemId = params.get("id");

// 1. FUNÇÃO DE CARREGAMENTO (DOCKER)
async function carregarReviewsDoServidor() {
    try {
        console.log("Buscando reviews no Docker...");
        const res = await fetch(`http://${currentHost}:5001/api/reviews?item_id=${currentItemId}&categoria=${currentCategory}`);
        const reviews = await res.json();

        const container = document.getElementById("reviews"); // ID que você usa no HTML
        if (!container) return;
        
        container.innerHTML = ""; // Limpa a tela antes de mostrar as do banco

        reviews.forEach(rev => {
            adicionarReviewNaTela(rev.rating, rev.comment, rev.author);
        });
    } catch (e) {
        console.error("Error loading reviews from Docker:", e);
    }
}

// 2. ADICIONAR VISUALMENTE
function adicionarReviewNaTela(nota, texto, user) {
    const container = document.getElementById("reviews");
    if (!container) return;

    const review = document.createElement("div");
    review.classList.add("review-card"); // Certifique-se que essa classe existe no seu CSS
    review.innerHTML = `
        <div class="review-note">${nota}/10</div>
        <p class="text-white mt-4">${texto}</p>
        <p class="text-gray-400 mt-2">User: ${user}</p>
    `;
    container.prepend(review);
}

// 3. ENVIAR PARA O DOCKER
async function submitReview() {
    const userLoggedIn = sessionStorage.getItem("userLoggedIn");
    const reviewInput = document.getElementById("reviewText");
    const text = reviewInput ? reviewInput.value.trim() : "";

    if (!userLoggedIn) { alert("Please login first!"); 
        window.location.href = "login.html"; return; }
    if (selectedRating === null || text === "") { alert("Rating and write a comment!"); return; }

    const reviewData = {
        item_id: currentItemId,
        categoria: currentCategory,
        rating: selectedRating,
        comment: text,
        author: userLoggedIn
    };

    try {
        const response = await fetch(`http://${currentHost}:5001/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            // Em vez de só adicionar na tela, vamos recarregar do banco para garantir
            carregarReviewsDoServidor();
            reviewInput.value = "";
            selectedRating = null;
            document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
        }
    } catch (e) {
        alert("Error saving review on the server.");
    }
}

// 4. INICIALIZAÇÃO
async function inicializarSistemaCompleto() {
    const containerGlobal = document.getElementById("container-review-global");
    if (!containerGlobal) {
        console.warn("Container 'container-review-global' não encontrado.");
        return;
    }

    try {
        // Tente usar o caminho relativo correto aqui
        const response = await fetch('review.html'); 
        if (!response.ok) throw new Error("Não foi possível carregar review.html");
        
        const html = await response.text();
        containerGlobal.innerHTML = html;
        
        inicializarBotoes();
        checkLoginStatus();
        carregarReviewsDoServidor();
        
    } catch (error) {
        console.error("Erro crítico no review.js:", error);
    }
}

// Use apenas UM event listener
document.addEventListener("DOMContentLoaded", inicializarSistemaCompleto);

function inicializarBotoes() {
    const ratingContainer = document.getElementById("ratingButtons");
    if (!ratingContainer) return;
    ratingContainer.innerHTML = ""; // Limpa para não duplicar

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
    const formReview = document.getElementById("reviewForm");
    if (!userLoggedIn && formReview) {
        formReview.innerHTML = `<p class="text-white text-center p-4">Please <a href="login.html" class="text-blue-400 underline">login</a> to review.</p>`;
    }
}

// ÚNICO PONTO DE ENTRADA NECESSÁRIO
//window.addEventListener('DOMContentLoaded', inicializarSistemaCompleto);

// No final do review.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema de reviews iniciando...");
    const containerGlobal = document.getElementById("container-review-global");
    if (containerGlobal) {
        inicializarSistemaCompleto(); 
    }
});