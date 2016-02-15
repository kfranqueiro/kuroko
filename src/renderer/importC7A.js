'use strict';
const fs = require('fs');
const util = require('./util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const REGION1_OFFSET = 608;
const REGION1_ENTRY_SIZE = 32;
const REGION1_NAME_OFFSET = 0;
const REGION2_OFFSET = 4832;
const REGION2_ENTRY_SIZE = 32;
const REGION2_NAME_OFFSET = 16;
const PERFORMANCES_OFFSET = 13088;
const PERFORMANCE_SIZE = 640;
const PERFORMANCE_NAME_OFFSET = 0;
const PERFORMANCE_NAME_SIZE = 10;

function parsePerformance(buffer) {
	return {
		name: buffer.toString('ascii', PERFORMANCE_NAME_OFFSET, PERFORMANCE_NAME_OFFSET + PERFORMANCE_NAME_SIZE)
	};
}

function exportC7A(buffer, performances) {
	const newBuffer = new Buffer(buffer);
	performances.forEach((performance, i) => {
		newBuffer.write(performance.name,
			REGION1_OFFSET + REGION1_ENTRY_SIZE * i + REGION1_NAME_OFFSET,
			'ascii');
		newBuffer.write(performance.name,
			REGION2_OFFSET + REGION2_ENTRY_SIZE * i + REGION2_NAME_OFFSET,
			'ascii');
		buffer.copy(newBuffer,
			PERFORMANCES_OFFSET + i * PERFORMANCE_SIZE,
			performance.originalOffset,
			performance.originalOffset + PERFORMANCE_SIZE);
	});
	return newBuffer;
}

function C7A(buffer) {
	let performances;

	this.exportToFile = function (filename) {
		return writeFile(filename, exportC7A(buffer, performances));
	};

	this.forEach = function (callback, context) {
		performances.forEach(callback, context);
	};

	this.reorder = function (indices) {
		const originalPerformances = performances;
		performances = indices.map(function (index) {
			return originalPerformances[index];
		});
	};

	this.revert = function () {
		performances = [];
		for (let i = 0; i < 128; i++) {
			const offset = PERFORMANCES_OFFSET + i * PERFORMANCE_SIZE;
			const performance = parsePerformance(buffer.slice(offset, offset + 640));
			performance.originalOffset = offset;
			performances.push(performance);
		}
	};

	this.revert();
}

module.exports = function (filename) {
	return readFile(filename).then((buffer) => {
		return new C7A(buffer);
	});
};
