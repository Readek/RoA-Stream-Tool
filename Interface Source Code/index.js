const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const { ipcMain } = require('electron')

let failed = false;

function createWindow() {

    let resourcesPath, guiWidth, guiHeight;

    try {

        if (process.platform == "win32") { // if on Windows
            resourcesPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources')
        } else { // if on Linux
            resourcesPath = path.resolve('.', 'Resources')
        }
        
        const guiSettings = JSON.parse(fs.readFileSync(resourcesPath + "/Texts/GUI Settings.json"))
        guiWidth = guiSettings.guiWidth
        guiHeight = guiSettings.guiHeight
        if (process.platform == "win32") {
            guiHeight = guiHeight + 29 // windows why cant you be normal
        }

    } catch (e) {
        failed = true
        guiWidth = 600
        guiHeight = 300
    }

    const win = new BrowserWindow({

        width: guiWidth,
        height: guiHeight,

        resizable: false,

        icon: path.join(__dirname, 'icon.png'),

        webPreferences: {
            // this is almost deprecated functionallity as of electron 15, however
            // i have not found a better way to make files external to the insides
            // of the exe work with electron, todo find a more updated way to do so
            nodeIntegration: true,
            contextIsolation: false
        },

    })

    // we dont like menus
    win.removeMenu()

    // load the main page
    if (failed) { // in case something failed earlier
        win.loadFile(path.join(__dirname, 'failed.html'));
    } else {
        win.loadFile(resourcesPath + "/GUI.html");
    }
    
    // keyboard shortcuts!
    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F5') { // refresh the page
            win.reload()
            event.preventDefault()
        } else if (input.key === 'F6') { // web console
            win.webContents.openDevTools()
            win.setResizable(true)
            event.preventDefault()
        }
    })

    ipcMain.on('alwaysOnTop', (event, arg) => {
        if (arg) {
            win.setAlwaysOnTop(true)
        } else {
            win.setAlwaysOnTop(false)
        }
    })
    
}



// create window on startup
app.whenReady().then(() => {
    createWindow()
});

// close electron when all windows close (for Windows and Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

// todo close electron for mac, if there ever is support for it that is
