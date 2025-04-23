const path = require("path");
const { app, BrowserWindow } = require("electron");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, "dist/renderer/index.html")}`
    : "http://localhost:3000";

  win.loadURL(startUrl);

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!win) createWindow();
});
