from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# O banco de dados será criado nesta pasta dentro do container
DB_DIR = 'database'
DB_PATH = os.path.join(DB_DIR, 'universetech.db')

def init_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Criar tabela de usuários se não existir
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')
    
    # Criar tabela de reviews se não existir
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT,     
            categoria TEXT,  
            rating INTEGER,
            comment TEXT,
            author TEXT
        )
    ''')
    conn.commit()
    conn.close()

# ROTA PARA BUSCAR REVIEWS (Lê do SQLite)
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    item_id = request.args.get('item_id')
    categoria = request.args.get('categoria')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if item_id and categoria:
        cursor.execute("SELECT * FROM reviews WHERE item_id = ? AND categoria = ?", (item_id, categoria))
    else:
        cursor.execute("SELECT * FROM reviews")
        
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in rows])

# ROTA PARA SALVAR REVIEW (Grava no SQLite)
@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reviews (item_id, categoria, rating, comment, author)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['item_id'], data['categoria'], data['rating'], data['comment'], data['author']))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"}), 201

# ROTA PARA CADASTRO
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (user, email, password) VALUES (?, ?, ?)',
                       (data['username'], data['email'], data['password']))
        conn.commit()
        return jsonify({"status": "success"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 400
    finally:
        conn.close()

# ROTA PARA LOGIN
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", 
                   (data['email'], data['password']))
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify({"status": "success", "username": user['user']}), 200
    return jsonify({"error": "Invalid credentials"}), 401

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)