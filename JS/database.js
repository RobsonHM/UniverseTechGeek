// JS/database.js
console.log("Arquivo database.js foi carregado com sucesso!");

async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    let db;
    const savedData = localStorage.getItem("universetech_db");

    if (savedData) {
        try {
            // Carrega o banco existente
            db = new SQL.Database(new Uint8Array(JSON.parse(savedData)));
            console.log("Banco carregado do LocalStorage.");
        } catch (e) {
            console.error("Erro ao ler banco salvo, criando novo...", e);
            db = new SQL.Database();
        }
    } else {
        db = new SQL.Database();
        console.log("Novo banco criado.");
    }

    // GARANTE QUE AS TABELAS EXISTAM (Sempre roda, mesmo no F5)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            item_id TEXT,     
            categoria TEXT,  
            rating INTEGER,
            comment TEXT,
            author TEXT,
            FOREIGN KEY (usuario_id) REFERENCES users(id)
        );
    `);
    
    // Torna o db global
    window.db = db;

    // Função para salvar
    db.persist = () => {
        const data = db.export();
        localStorage.setItem("universetech_db", JSON.stringify(Array.from(data)));
        console.log("Banco persistido!");
    };

    return db;
}

window.initDatabase = initDatabase;