const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database.js');

let mainWindow;
let history = []; // Array para armazenar o histórico de navegação

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('login.html'); // Carrega a tela de login como a primeira página
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Manipulação de IPC para navegação entre páginas
ipcMain.on('navigate', (event, page) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
        history.push(page); // Adiciona a página ao histórico
        mainWindow.loadFile(page);
    }
});

// Manipulação de IPC para voltar à página anterior
ipcMain.on('goBack', (event) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow && history.length > 1) {
        history.pop(); // Remove a página atual do histórico
        const previousPage = history.pop(); // Obtém a página anterior
        mainWindow.loadFile(previousPage); // Carrega a página anterior
    }
});

// Manipulação de IPC para inserir um novo login
ipcMain.handle('inserirLogin', (event, novoLogin) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO logins (usuario, login, senha) VALUES (?, ?, ?)`;
        db.run(sql, [novoLogin.usuario, novoLogin.login, novoLogin.senha], function(err) {
            if (err) {
                console.error('Erro ao inserir login:', err.message);
                return reject(err);
            }
            console.log(`Login cadastrado com ID: ${this.lastID}`);
            resolve(this.lastID); // Retorna o ID do novo registro
        });
    });
});

// Manipulação de IPC para autenticar usuário
ipcMain.handle('autenticarUsuario', (event, { username, password }) => {
    if (username === 'admin' && password === 'admin') {
        return { success: true }; // Autenticação bem-sucedida
    }
    return { success: false }; // Autenticação falhou
});

// Inicializa o banco de dados
db.criarTabelaFornecedores();
db.criarTabelaLogins();