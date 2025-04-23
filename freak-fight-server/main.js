const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;

function createWindow() {
  // Tworzymy nowe okno przeglądarki
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Ładujemy stronę React z folderu build
  win.loadURL(`file://${path.join(__dirname, 'build', 'index.html')}`);  // Jeśli używasz lokalnego pliku

  win.on('closed', () => {
    win = null;
  });
}

// Uruchamiamy aplikację Electron, kiedy jest gotowa
app.on('ready', createWindow);

// Wyjście z aplikacji, gdy wszystkie okna są zamknięte
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
