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
    // 1. Get the input values from your HTML
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // 2. Ensure the database is loaded
        if (!window.db) {
            await initDatabase();
        }

        // 3. Search for the user in SQLite
        // res[0].values will return the data if it finds the exact email and password
        const res = db.exec("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (res.length > 0 && res[0].values.length > 0) {
            // Success! 
            const usuario = res[0].values[0]; // Get the first row found
            const nomeDoUsuario = usuario[1]; // Assuming the name is the second column

            // Save in the browser session (Session Storage)
            sessionStorage.setItem("userLoggedIn", nomeDoUsuario);
            
            alert("Login successful! Welcome, " + nomeDoUsuario);
            
            // 4. Redirect to home
            window.location.href = "../home.html"; 
        } else {
            // If nothing is found in the SELECT
            alert("Incorrect email or password.");
        }
    } catch (e) {
        console.error("Error during login:", e);
        alert("A technical error occurred. Please check if you have already registered.");
    }
    // Inside the successful login logic
    const userdata = res[0].values[0]; 
    const username = userdata[1]; // Index 1 is the 'user' column in your table

    // Let's standardize the key name to 'userLoggedIn'
    sessionStorage.setItem("userLoggedIn", username);
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
    const userLoggedIn = sessionStorage.getItem("userLoggedIn");
    const loginLink = document.getElementById("nav-login");
    const logoutBtn = document.getElementById("nav-logout");

    if (!loginLink || !logoutBtn) return;

    if (userLoggedIn) {
        // USUÁRIO LOGADO
        loginLink.style.display = "none";  // Esconde o "U"
        logoutBtn.style.display = "block"; // Mostra o "Logout"
        
        // Opcional: Mudar a letra "U" pelo nome do usuário
        loginLink.innerText = userLoggedIn.charAt(0).toUpperCase();
    } else {
        // USUÁRIO DESLOGADO
        loginLink.style.display = "flex";  // Mostra o "U"
        logoutBtn.style.display = "none";  // Esconde o "Logout"
    }
}

// Chamar a função assim que o DOM carregar
document.addEventListener("DOMContentLoaded", gerenciarMenuUsuario);