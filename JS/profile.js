const messageBox = document.getElementById('message');

// CONFIGURAÇÃO DINÂMICA: Descobre o IP do Mac automaticamente
const API_URL = `http://${currentHost}:5001/api`;

function showMsg(text, isError = false) {
    messageBox.innerText = text;
    messageBox.style.display = 'block';
    messageBox.style.backgroundColor = isError ? '#cc0000' : '#008800';
    setTimeout(() => messageBox.style.display = 'none', 3000);
}

async function initProfile() {
    const user = sessionStorage.getItem("userLoggedIn");
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // 1. CARREGAR DADOS DO USUÁRIO E CONTAGEM DE REVIEWS
    try {
        // Vamos pedir todas as reviews ao Docker
        const response = await fetch(`${API_URL}/reviews`);
        const allReviews = await response.json();

        // Filtramos apenas as reviews escritas por este usuário
        const userReviews = allReviews.filter(rev => rev.author === user);
        const total = userReviews.length;

        // Atualiza a interface
        document.getElementById('user-name').innerText = user;
        document.getElementById('edit-name').value = user;
        document.getElementById('avatar').innerText = user.charAt(0).toUpperCase();
        document.getElementById('count-reviews').innerText = total;

        // Lógica de Rank (Corrigida a ordem dos IFs para funcionar do menor para o maior)
        let rank = "Noob";
        if (total > 20) rank = "Legendary";
        else if (total > 15) rank = "Elite";
        else if (total > 10) rank = "Veteran";
        else if (total > 5) rank = "Initiate";
        
        document.getElementById('user-rank').innerText = rank;

        // Nota: O email agora viria de uma rota de perfil no Python. 
        // Se não criou essa rota, podemos deixar um placeholder ou buscar no login.
        document.getElementById('user-email').innerText = "Logged in via Docker";

    } catch (err) {
        console.error("Erro ao carregar perfil do Docker:", err);
        showMsg("Erro ao conectar com o servidor.", true);
    }
}

// ATUALIZAÇÃO DE PERFIL (Update no Docker)
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg("A edição de perfil requer uma rota de UPDATE no app.py.", true);
    // Para simplificar na faculdade, foque no Login e Reviews que já estão funcionando!
});

function handleLogout() {
    sessionStorage.removeItem("userLoggedIn");
    window.location.href = "../home.html";
}

window.onload = initProfile;