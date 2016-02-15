'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;

const menu = module.exports = [];
const isDarwin = process.platform === 'darwin';

function send() {
	var webContents = BrowserWindow.getFocusedWindow().webContents;
	webContents.send.apply(webContents, arguments);
}

menu.push(
	{
		label: '&File',
		submenu: [
			{
				label: '&Open...',
				accelerator: 'CmdOrCtrl+O',
				click: function () {
					const window = BrowserWindow.getFocusedWindow();
					dialog.showOpenDialog(window, {
						filters: [ { name: 'C7A Files', extensions: [ 'C7A' ] } ],
						properties: [ 'openFile' ]
					}, function (filename) {
						if (filename && filename[0]) {
							window.webContents.send('load', filename[0]);
						}
					});
				}
			},
			{
				label: '&Save',
				accelerator: 'CmdOrCtrl+S',
				enabled: false,
				click: function () {
					send('save');
				}
			},
			{
				label: 'Save &As...',
				accelerator: 'CmdOrCtrl+Shift+S',
				enabled: false,
				click: function () {
					const window = BrowserWindow.getFocusedWindow();
					dialog.showSaveDialog(window, {
						filters: [ { name: 'C7A Files', extensions: [ 'C7A' ] } ]
					}, function (filename) {
						if (filename) {
							window.webContents.send('save', filename);
						}
					});
				}
			},
			{
				label: '&Revert',
				accelerator: 'CmdOrCtrl+Shift+R',
				enabled: false,
				click: function () {
					send('load');
				}
			},
			{
				label: '&Quit',
				accelerator: 'CmdOrCtrl+Q',
				click: function () {
					app.quit();
				}
			}
		]
	}
);

if (process.env.ELECTRON_APP_DEBUG) {
	menu.push(
		{
			label: '&Debug',
			submenu: [
				{
					label: '&Reload',
					accelerator: 'CmdOrCtrl+R',
					click: function () {
						BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
					}
				},
				{
					label: 'Toggle &Developer Tools',
					accelerator: isDarwin ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
					click: function () {
						BrowserWindow.getFocusedWindow().toggleDevTools();
					}
				}
			]
		}
	);
}
