'use strict';
const pathUtil = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const Menu = electron.Menu;

const menuTemplate = require('./menu');
const title = 'Kuroko';

let mainWindow;
let menu;

app.on('window-all-closed', function () {
	app.quit();
});

app.on('ready', function () {
	mainWindow = new BrowserWindow({
		center: true,
		title: title,
		height: 420,
		minHeight: 420,
		width: 1000,
		minWidth: 800
	});

	menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	mainWindow.loadURL('file://' + require('path').resolve(__dirname, '..', 'index.html'));

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
});

let displayedFilename;
ipc.on('file-loaded', function (event, filename) {
	displayedFilename = pathUtil.basename(filename);
	mainWindow.setTitle(displayedFilename + ' - ' + title);
	mainWindow.setRepresentedFilename(filename);
	mainWindow.setDocumentEdited(false);

	menu.items[0].submenu.items.forEach(function (item) {
		item.enabled = true;
	});
});

ipc.on('dirty', function (event, isDirty) {
	mainWindow.setTitle(displayedFilename + (isDirty ? '*' : '') + ' - ' + title);
	mainWindow.setDocumentEdited(isDirty);
});
