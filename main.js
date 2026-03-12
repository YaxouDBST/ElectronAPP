const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Supprime totalement la barre de menu native
Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 800,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    title: 'Rachou',
    icon: path.join(__dirname, 'images', 'logo.png'),
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
