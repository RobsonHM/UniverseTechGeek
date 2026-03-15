async function NewUser(name, email, password) {
    
    try {
        db.run("INSERT INTO users (user, email, password) VALUES (?, ?, ?)", [name, email, password]);
        db.persist();
        alert("Usuário criado com sucesso!");
    } catch (e) {
        alert("Erro: Este usuário já existe!");
    }
}

async function loginUser() {
    // 1. Pega os valores dos inputs do seu HTML
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // 2. Garante que o banco de dados foi carregado
        if (!window.db) {
            await initDatabase();
        }

        // 3. Busca o usuário no SQLite
        // res[0].values retornará os dados se encontrar o e-mail e a senha exatos
        const res = db.exec("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (res.length > 0 && res[0].values.length > 0) {
            // Sucesso! 
            const usuario = res[0].values[0]; // Pega a primeira linha encontrada
            const nomeDoUsuario = usuario[1]; // Supondo que o nome é a segunda coluna

            // Salva na sessão do navegador (Session Storage)
            sessionStorage.setItem("userLoggedIn", nomeDoUsuario);
            
            alert("Login realizado com sucesso! Bem-vindo, " + nomeDoUsuario);
            
            // 4. Redireciona para a home
            window.location.href = "../home.html"; 
        } else {
            // Se não encontrar nada no SELECT
            alert("E-mail ou senha incorretos.");
        }
    } catch (e) {
        console.error("Erro ao fazer login:", e);
        alert("Ocorreu um erro técnico. Verifique se você já se cadastrou.");
    }
    // Dentro da lógica de sucesso do login
    const userdata = res[0].values[0]; 
    const username = userdata[1]; // Índice 1 é a coluna 'user' da sua tabela

    // Vamos padronizar o nome da chave para 'userLoggedIn'
    sessionStorage.setItem("userLoggedIn", username);
}

function logout() {
    // 1. Remove apenas o usuário da sessão
    sessionStorage.removeItem("userLoggedIn"); 
    
    // Opcional: Se quiser limpar TUDO da sessão (cuidado se houver outros dados)
    // sessionStorage.clear();

    alert("Você saiu do sistema.");

    // 2. Redireciona para a home ou login
    window.location.href = "home.html"; 
}