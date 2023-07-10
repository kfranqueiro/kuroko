"use strict";
const { BrowserWindow, app, dialog, Menu } = require("electron");

const { load, save } = require("./c7a");
const { updateWindowForFile, updateWindowForDirtyState } = require("./window");

const isDarwin = process.platform === "darwin";

function send() {
  const webContents = BrowserWindow.getAllWindows()[0].webContents;
  webContents.send.apply(webContents, arguments);
}

/**
 * Determines the current order of performances from the DOM in the renderer process.
 * @returns Promise<number[]>
 */
function getIndices() {
  const webContents = BrowserWindow.getAllWindows()[0].webContents;
  return webContents.executeJavaScript(
    `Array.prototype.slice.call(container.children).map((li) => +li.getAttribute('data-index'))`
  );
}

const menuTemplate = [
  {
    label: "&File",
    submenu: [
      {
        label: "&Open...",
        accelerator: "CmdOrCtrl+O",
        async click(_, window) {
          const { canceled, filePaths } = await dialog.showOpenDialog(window, {
            filters: [{ name: "C7A Files", extensions: ["C7A"] }],
            properties: ["openFile"],
          });
          if (!canceled && filePaths[0]) {
            try {
              const performances = await load(filePaths[0]);
              updateWindowForFile(window, filePaths[0]);
              send("performances-loaded", performances);
            } catch (error) {
              send("alert", `Error loading file: ${error.message}`);
            }
          }
        },
      },
      {
        label: "&Save",
        accelerator: "CmdOrCtrl+S",
        enabled: false,
        async click(_, window) {
          try {
            await save(await getIndices());
            updateWindowForDirtyState(window, false);
          } catch (error) {
            send("alert", `Error saving file: ${error.message}`);
          }
        },
      },
      {
        label: "Save &As...",
        accelerator: "CmdOrCtrl+Shift+S",
        enabled: false,
        async click(_, window) {
          const { filePath } = await dialog.showSaveDialog(window, {
            filters: [{ name: "C7A Files", extensions: ["C7A"] }],
          });
          if (filePath) {
            try {
              await save(await getIndices(), filePath);
              updateWindowForFile(window, filePath);
            } catch (error) {
              send("alert", `Error saving file: ${error.message}`);
            }
          }
        },
      },
      {
        label: "&Revert",
        accelerator: "CmdOrCtrl+Shift+R",
        enabled: false,
        async click(_, window) {
          try {
            const performances = await load();
            send("performances-loaded", performances);
            updateWindowForDirtyState(window, false);
          } catch (error) {
            send("alert", `Error loading file: ${error.message}`);
          }
        },
      },
      {
        label: "&Quit",
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

if (process.env.KUROKO_DEV) {
  menuTemplate.push({
    label: "&Debug",
    submenu: [
      {
        label: "&Reload",
        accelerator: "CmdOrCtrl+R",
        click(_, window) {
          window.webContents.reloadIgnoringCache();
        },
      },
      {
        label: "Toggle &Developer Tools",
        accelerator: isDarwin ? "Alt+Cmd+I" : "Ctrl+Shift+I",
        click(_, window) {
          window.toggleDevTools();
        },
      },
    ],
  });
}

module.exports = Menu.buildFromTemplate(menuTemplate);
