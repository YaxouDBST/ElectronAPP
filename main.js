const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Supprime totalement la barre de menu native
Menu.setApplicationMenu(null);

// Force Windows à utiliser l'icône de l'app
app.setAppUserModelId('com.rachou.game');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    resizable: true,
    minWidth: 420,
    minHeight: 600,
    maximizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    title: 'Rachou',
    icon: path.join(__dirname, 'images', 'logo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
