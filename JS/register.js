// JS/cadastro.js

async function NewUser() {
    // 1. Pega os valores dos inputs
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // 2. Garante que o banco está carregado
        if (!window.db) {
            window.db = await initDatabase();
        }

        // 3. Insere no SQLite
        // IMPORTANTE: Verifique se sua tabela no database.js tem exatamente essas colunas
        db.run("INSERT INTO users (user, email, password) VALUES (?, ?, ?)", [username, email, password]);
        
        // 4. Salva no LocalStorage do Mac
        db.persist();

        alert("Cadastro realizado com sucesso!");
        
        // 5. Redireciona via JS (isso não gera erro 405)
        window.location.href = "login.html"; 

    } catch (e) {
        console.error("Erro no SQLite:", e);
        alert("Erro ao cadastrar. Verifique o console.");
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