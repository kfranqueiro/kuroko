/** @fileoverview Utilities for updating the app window */

// BrowserWindow is only referenced for typings
// eslint-disable-next-line no-unused-vars
const { BrowserWindow } = require("electron");
const { basename } = require("path");

const { TITLE } = require("./constants");

// Maintain current filename for easier title reconstruction, since there's only one window
let currentFilename = "";

module.exports = {
  /**
   * Updates the window's title/decorations to reflect the specified filename.
   * @param {BrowserWindow} window
   * @param {string} filename
   */
  updateWindowForFile(window, filename) {
    currentFilename = basename(filename);
    window.setTitle(`${currentFilename} - ${TITLE}`);
    window.setRepresentedFilename(filename);
    window.setDocumentEdited(false);

    // Enable all menu entries once a file has been opened
    // (using inline require to avoid cyclic dependency)
    require("./menu").items[0].submenu.items.forEach((item) => (item.enabled = true));
  },

  /**
   * Updates the window's title/decorations to reflect the specified dirty state.
   * @param {BrowserWindow} window
   * @param {boolean} isDirty
   */
  updateWindowForDirtyState(window, isDirty) {
    window.setTitle(`${currentFilename}${isDirty ? "*" : ""} - ${TITLE}`);
    window.setDocumentEdited(isDirty);
  },
};
