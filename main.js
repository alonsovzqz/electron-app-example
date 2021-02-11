const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const Datastore = require("nedb");
const todosDB = new Datastore({
  filename: path.join(__dirname, "todos.db"),
  autoload: true,
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Catch todo:add
ipcMain.on("todo:add", (e, item) => {
  todosDB.insert(item, (err, doc) => {
    console.log("Inserted ", doc.item, " with ID ", doc._id);
  });
  e.reply("todo:adding", item);
});

// Catch todo:db:existing
ipcMain.on("todo:db:existing", (e, arg) => {
  todosDB.find({}, (err, docs) => {
    if (err) throw err;

    e.reply("todo:all-docs", docs);
  });
});

// Catch todo:checked-item
ipcMain.on("todo:checked-item", (e, args) => {
  const { item, status } = args;
  todosDB.update(
    { item: item },
    { item: item, completed: status },
    {},
    (err, doc) => {
      if (err) throw err;
      console.log("Updated correctly...");
    }
  );
});

// Catch todo:remove-item
ipcMain.on("todo:remove-item", (e, arg) => {
  todosDB.remove({ _id: arg }, {}, (err, numRemoved) => {
    if (err) throw err;

    console.log("Removed ", numRemoved, " doc(s) from DB...");
  });
});
