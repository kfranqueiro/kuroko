'use strict';
const ipc = require('electron').ipcRenderer;
const importC7A = require('./importC7A');

const container = document.getElementById('container');

let currentFile;
let currentC7A;

function renderItem(element, item) {
	element.appendChild(document.createTextNode(item.name));
}

function renderPerformances() {
	container.innerHTML = '';
	currentC7A.forEach(function (performance, i) {
		const li = document.createElement('li');
		li.setAttribute('data-index', i);
		li.draggable = true;
		renderItem(li, performance);
		container.appendChild(li);
	});
}

ipc.on('load', function (event, filename) {
	filename = filename || currentFile;
	if (!filename) {
		return;
	}

	importC7A(filename).then(function (c7a) {
		currentFile = filename;
		currentC7A = c7a;
		ipc.send('file-loaded', filename);
		renderPerformances();
	}, function (error) {
		alert('Failed to open file: ' + error);
	});
});

ipc.on('save', function (event, filename) {
	filename = filename || currentFile;
	if (!filename || !currentC7A) {
		return;
	}

	currentC7A.reorder(Array.prototype.slice.call(container.children).map(function (li) {
		return +li.getAttribute('data-index');
	}));
	currentC7A.exportToFile(filename).then(function () {
		currentFile = filename;
		ipc.send('file-loaded', filename);
	}, function (error) {
		alert('Failed to save file: ' + error);
	});
});

let draggedElement;

function compareToSwapRange(y, targetHeight) {
	if (y < targetHeight * 2 / 5) {
		return -1;
	}
	if (y > targetHeight * 3 / 5) {
		return 1;
	}
	return 0;
}

container.addEventListener('dragstart', function (event) {
	draggedElement = event.target;
	event.dataTransfer.setData('text/plain', event.target.getAttribute('data-index'));
	event.dataTransfer.effectAllowed = 'move';
});

container.addEventListener('dragover', function (event) {
	const target = event.target;
	if (target.tagName !== 'LI') {
		return;
	}
	event.preventDefault();

	const compared = compareToSwapRange(event.offsetY, target.offsetHeight);
	if (compared < 0) {
		target.className = 'insertBefore';
	}
	else if (compared > 0) {
		target.className = 'insertAfter';
	}
	else {
		target.className = 'insertInto';
	}
});

container.addEventListener('dragleave', function (event) {
	if (event.target.tagName === 'LI') {
		event.target.className = '';
	}
});

container.addEventListener('drop', function (event) {
	event.preventDefault();
	let target = event.target;

	if (target.tagName !== 'LI') {
		return;
	}

	ipc.send('dirty', true);
	target.className = '';
	const compared = compareToSwapRange(event.offsetY, target.offsetHeight);

	if (compared === 0) {
		const oldNextSibling = draggedElement.nextSibling;
		container.insertBefore(draggedElement, target);
		container.insertBefore(target, oldNextSibling);
		return;
	}

	if (compared > 0) {
		target = target.nextSibling;
	}
	container.insertBefore(draggedElement, target);
});
