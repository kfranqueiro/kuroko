"use strict";

/* global electronApi */

(() => {
  const container = document.getElementById("container");

  function renderItem(element, item) {
    element.appendChild(document.createTextNode(item.name));
  }

  /**
   * @param {Performance[]} performances
   */
  function renderPerformances(performances) {
    container.innerHTML = "";
    performances.forEach(function (performance, i) {
      const li = document.createElement("li");
      li.setAttribute("data-index", i);
      li.draggable = true;
      renderItem(li, performance);
      container.appendChild(li);
    });
  }

  electronApi.onAlert((_, message) => alert(message));
  electronApi.onPerformancesLoaded((_, performances) => renderPerformances(performances));

  let draggedElement;

  function compareToSwapRange(y, targetHeight) {
    if (y < (targetHeight * 2) / 5) {
      return -1;
    }
    if (y > (targetHeight * 3) / 5) {
      return 1;
    }
    return 0;
  }

  container.addEventListener("dragstart", (event) => {
    draggedElement = event.target;
    event.dataTransfer.setData("text/plain", event.target.getAttribute("data-index"));
    event.dataTransfer.effectAllowed = "move";
  });

  container.addEventListener("dragover", (event) => {
    const target = event.target;
    if (target.tagName !== "LI") return;

    event.preventDefault();

    const compared = compareToSwapRange(event.offsetY, target.offsetHeight);
    if (compared < 0) {
      target.className = "insertBefore";
    } else if (compared > 0) {
      target.className = "insertAfter";
    } else {
      target.className = "insertInto";
    }
  });

  container.addEventListener("dragleave", (event) => {
    if (event.target.tagName === "LI") {
      event.target.className = "";
    }
  });

  container.addEventListener("drop", (event) => {
    event.preventDefault();
    let target = event.target;

    if (target.tagName !== "LI") return;

    electronApi.markDirty(true);
    target.className = "";
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
})();
