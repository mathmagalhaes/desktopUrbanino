const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria ou abre um banco de dados SQLite
const db = new sqlite3.Database(path.join(__dirname, 'fornecedores.db'), (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Função para criar a tabela de fornecedores
function criarTabela() {
    const sql = `
        CREATE TABLE IF NOT EXISTS fornecedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            telefone TEXT NOT NULL
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error('Erro ao criar a tabela:', err.message);
        } else {
            console.log('Tabela de fornecedores criada ou já existe.');
        }
    });
}

// Função para inserir um novo fornecedor
function inserirFornecedor(fornecedor, callback) {
    const sql = `INSERT INTO fornecedores (nome, email, telefone) VALUES (?, ?, ?)`;
    db.run(sql, [fornecedor.nome, fornecedor.email, fornecedor.telefone], function(err) {
        if (err) {
            console.error('Erro ao inserir fornecedor:', err.message);
            callback(err);
        } else {
            console.log(`Fornecedor adicionado com ID: ${this.lastID}`);
            callback(null, this.lastID);
        }
    });
}

// Função para listar todos os fornecedores
function listarFornecedores(callback) {
    const sql = `SELECT * FROM fornecedores`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao listar fornecedores:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// Exporta as funções para uso em outros módulos
module.exports = {
    criarTabela,
    inserirFornecedor,
    listarFornecedores
};