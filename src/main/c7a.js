"use strict";
const fsPromises = require("fs").promises;

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

/**
 * @typedef {{
 *   name: string;
 *   originalOffset: number;
 * }} Performance
 */

class C7A {
  /** @type {Buffer} */
  #buffer;
  /** @type {Performance[]} */
  #performances = [];

  constructor(buffer) {
    this.#buffer = buffer;
    this.revert();
  }

  /**
   * @param {string} filename
   */
  exportToFile(filename) {
    const newBuffer = Buffer.from(this.#buffer);
    this.#performances.forEach((performance, i) => {
      newBuffer.write(
        performance.name,
        REGION1_OFFSET + REGION1_ENTRY_SIZE * i + REGION1_NAME_OFFSET,
        "ascii"
      );
      newBuffer.write(
        performance.name,
        REGION2_OFFSET + REGION2_ENTRY_SIZE * i + REGION2_NAME_OFFSET,
        "ascii"
      );
      this.#buffer.copy(
        newBuffer,
        PERFORMANCES_OFFSET + i * PERFORMANCE_SIZE,
        performance.originalOffset,
        performance.originalOffset + PERFORMANCE_SIZE
      );
    });

    return fsPromises.writeFile(filename, newBuffer);
  }

  getPerformances() {
    return this.#performances.slice();
  }

  /**
   * @param {number} indices
   */
  reorder(indices) {
    const originalPerformances = this.#performances;
    this.#performances = indices.map((index) => originalPerformances[index]);
  }

  revert() {
    this.#performances = [];
    for (let i = 0; i < 128; i++) {
      const offset = PERFORMANCES_OFFSET + i * PERFORMANCE_SIZE;
      this.#performances.push({
        name: this.#buffer
          .slice(offset, offset + PERFORMANCE_SIZE)
          .toString(
            "ascii",
            PERFORMANCE_NAME_OFFSET,
            PERFORMANCE_NAME_OFFSET + PERFORMANCE_NAME_SIZE
          ),
        originalOffset: offset,
      });
    }
  }
}

/** @type {C7A} */
let currentC7A;
/** @type {string} */
let currentFilename;

module.exports = {
  /**
   * Loads from the specified C7A file, or reloads from the currently-loaded file.
   * @param {string} filename
   * @returns {Performance[]}
   */
  async load(filename = currentFilename) {
    if (!filename) return;
    currentC7A = new C7A(await fsPromises.readFile(filename));
    currentFilename = filename;
    return currentC7A.getPerformances();
  },

  /**
   * Saves to the specified or currently-loaded C7A file.
   * @param {number[]} indices
   * @param {string?} filename
   * @returns {Performance[]}
   */
  async save(indices, filename = currentFilename) {
    if (!filename) return;
    currentC7A.reorder(indices);
    await currentC7A.exportToFile(filename);
    currentFilename = filename;
    return currentC7A.getPerformances();
  },
};
