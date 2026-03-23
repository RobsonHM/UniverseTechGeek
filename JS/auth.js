const currentHost = window.location.hostname;

async function NewUser(name, email, password) {
    
    try {
        db.run("INSERT INTO users (user, email, password) VALUES (?, ?, ?)", [name, email, password]);
        db.persist();
        alert("User created successfully!");
    } catch (e) {
        alert("Error: This user already exists!");
    }
}

async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch(`http://${currentHost}:5001/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem("userLoggedIn", data.username);
            alert("Welcome, " + data.username);
            window.location.href = "../home.html";
        } else {
            alert("Incorrect email or password.");
        }
    } catch (e) {
        alert("Error connecting to the server.");
    }
}

function logout() {
    // 1. Remove apenas o usuário da sessão
    sessionStorage.removeItem("userLoggedIn"); 
    
    // Opcional: Se quiser limpar TUDO da sessão (cuidado se houver outros dados)
    // sessionStorage.clear();

    alert("You have logged out.");

    // 2. Redirect to home or login
    window.location.reload();
}

function gerenciarMenuUsuario() {
    const userLoggedIn = sessionStorage.getItem("userLoggedIn"); // Supondo que aqui esteja o NOME do usuário
    const loginLink = document.getElementById("nav-login");

    if (!loginLink) return;

    if (userLoggedIn) {
        // USUÁRIO LOGADO
        loginLink.style.display = "flex"; // MANTENHA VISÍVEL para mostrar a inicial
        //logoutBtn.style.display = "block"; 
        // Pega a primeira letra e exibe
        loginLink.innerText = userLoggedIn.charAt(0).toUpperCase();

    } else {
        // USUÁRIO DESLOGADO
        loginLink.style.display = "flex";
        loginLink.innerText = "P"; // Ou o ícone padrão
    }
}

// No final do auth.js
document.addEventListener("DOMContentLoaded", () => {
    try {
        gerenciarMenuUsuario();
    } catch (e) {
        console.error("Erro ao carregar menu de usuário:", e);
    }
});