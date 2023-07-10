"use strict";
const { join, resolve } = require("path");
const { BrowserWindow, Menu, app, ipcMain, session } = require("electron");

const { TITLE } = require("./constants");
const { updateWindowForFile, updateWindowForDirtyState } = require("./window");
const menu = require("./menu");

app.on("window-all-closed", () => app.quit());

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    cb({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": "script-src 'self'",
      },
    });
  });

  const mainWindow = new BrowserWindow({
    center: true,
    title: TITLE,
    height: 420,
    minHeight: 420,
    width: 1000,
    minWidth: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(menu);
  mainWindow.loadURL(`file://${resolve(__dirname, "..", "index.html")}`);

  ipcMain.on("file-loaded", (_, filename) => updateWindowForFile(mainWindow, filename));
  ipcMain.on("dirty", (_, isDirty) => updateWindowForDirtyState(mainWindow, isDirty));
});
