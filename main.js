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

    mainWindow.loadFile('index.html');
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
// Manipulação de IPC para atualizar a tabela de fornecedores
ipcMain.on('atualizarTabelaFornecedores', (event) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
        mainWindow.webContents.send('atualizarTabela'); // Envia uma mensagem para atualizar a tabela
    }
});
// Inicializa o banco de dados
db.criarTabela();