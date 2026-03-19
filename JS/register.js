// JS/cadastro.js

async function NewUser() {
    // 1. Pega os valores dos inputs
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // 2. Ensure the database is loaded
        if (!window.db) {
            window.db = await initDatabase();
        }

        // 3. Insert into SQLite
        // IMPORTANT: Make sure your table in database.js has exactly these columns
        db.run("INSERT INTO users (user, email, password) VALUES (?, ?, ?)", [username, email, password]);
        
        // 4. Save to LocalStorage
        db.persist();

        alert("Registration successful!");
        
        // 5. Redirect via JS (this does not generate a 405 error)
        window.location.href = "login.html"; 

    } catch (e) {
        console.error("SQLite error:", e);
        alert("Error during registration. Check the console.");

    }
}

// Vincula ao formulário quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("seu-form-id"); // Ajuste o ID do seu <form>
    if (form) {
        form.addEventListener("submit", lidarComCadastro);
    }
});

// No seu script da página de cadastro
const btn = document.getElementById("meuBotaoCadastro");
btn.onclick = () => {
    const n = document.getElementById("campoNome").value;
    const e = document.getElementById("campoEmail").value;
    const s = document.getElementById("campoSenha").value;
    cadastrarUsuario(n, e, s);
};