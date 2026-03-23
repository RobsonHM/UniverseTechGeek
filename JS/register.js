// JS/cadastro.js

async function NewUser() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        alert("Fill in all fields!");
        return;
    }

    try {
        const response = await fetch(`http://${currentHost}:5001/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert("User registered successfully!");
            window.location.href = "login.html";
        } else {
            const erro = await response.json();
            alert("Error: " + (erro.error || "Failed to register user. Try again."));
        }
    } catch (e) {
        console.error("Error connecting to Docker:", e);
        alert("The Docker server is not responding!");
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