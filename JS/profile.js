
const messageBox = document.getElementById('message');

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

    // Inicializa DB se necessário
    if (!window.db) {
        window.db = await initDatabase();
    }

    // 1. Carregar dados do Usuário
    const userRes = window.db.exec("SELECT email FROM users WHERE user = ?", [user]);
    if (userRes.length > 0) {
        document.getElementById('user-email').innerText = userRes[0].values[0][0];
    }

    document.getElementById('user-name').innerText = user;
    document.getElementById('edit-name').value = user;
    document.getElementById('avatar').innerText = user.charAt(0).toUpperCase();

    // 2. CONTAR REVIEWS (Baseado no seu review.js)
    try {
        // Seleciona o total de linhas onde o autor é o usuário logado
        const reviewRes = window.db.exec("SELECT COUNT(*) FROM reviews WHERE author = ?", [user]);
        
        if (reviewRes.length > 0) {
            const total = reviewRes[0].values[0][0];
            document.getElementById('count-reviews').innerText = total;
            
            // Lógica de Rank simples
            if (total <= 5) document.getElementById('user-rank').innerText = "Noob";
            else if (total > 5) document.getElementById('user-rank').innerText = "Initiate";
            else if (total > 10) document.getElementById('user-rank').innerText = "Veteran";
            else if (total > 15) document.getElementById('user-rank').innerText = "Elite";
            else if (total > 20) document.getElementById('user-rank').innerText = "Legendary";
        
        }
    } catch (err) {
        console.error("Erro ao contar reviews:", err);
    }
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldName = sessionStorage.getItem("userLoggedIn");
    const newName = document.getElementById('edit-name').value.trim();

    if (!newName || newName === oldName) return;

    try {
        // Atualiza Tabela de Usuários
        window.db.run("UPDATE users SET user = ? WHERE user = ?", [newName, oldName]);
        
        // Atualiza Tabela de Reviews para o histórico não se perder (visto no seu review.js)
        window.db.run("UPDATE reviews SET author = ? WHERE author = ?", [newName, oldName]);
        
        window.db.persist();
        sessionStorage.setItem("userLoggedIn", newName);
        
        showMsg("Perfil atualizado!");
        setTimeout(() => location.reload(), 1000);
    } catch (err) {
        showMsg("Erro ao atualizar nome.", true);
    }
});

function handleLogout() {
    sessionStorage.removeItem("userLoggedIn");
    window.location.href = "../home.html";
}

// Inicia tudo
window.onload = initProfile;