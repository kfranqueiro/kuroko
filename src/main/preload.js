const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
  markDirty(isDirty = true) {
    ipcRenderer.send("dirty", isDirty);
  },
  onAlert(cb) {
    ipcRenderer.on("alert", cb);
  },
  onPerformancesLoaded(cb) {
    ipcRenderer.on("performances-loaded", cb);
  },
});
