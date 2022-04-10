const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')


// start a web socket server on boot
const server = new WebSocket.Server({ port: 8080 });
let sockets = [];

function createWindow() {

    let resourcesPath, guiWidth, guiHeight, failed;

    try {

        if (process.platform == "win32") { // if on Windows
            resourcesPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources')
        } else { // if on Linux
            resourcesPath = path.resolve('.', 'Resources')
        }
        // if using npm/yarn start
        /* resourcesPath = path.resolve('..', 'Stream Tool', 'Resources') */
        
        const guiSettings = JSON.parse(fs.readFileSync(resourcesPath + "/Texts/GUI Settings.json"))
        guiWidth = guiSettings.guiWidth
        guiHeight = guiSettings.guiHeight
        if (process.platform == "win32") {
            guiHeight = guiHeight + 29 // windows why cant you be normal
        }

    } catch (e) { // if the settings file cant be found
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

    // always on top toggle from the GUI
    ipcMain.on('alwaysOnTop', (event, arg) => {
        if (arg) {
            win.setAlwaysOnTop(true)
        } else {
            win.setAlwaysOnTop(false)
        }
    })

    server.on('connection', (socket) => {

        // add this new connection to the array to keep track of them
        sockets.push(socket)
    
        // when a new client connects, send current data
        win.webContents.send('requestData')
    
        // when a socket closes, or disconnects, remove it from the array.
        socket.on('close', function() {
            sockets = sockets.filter(s => s !== socket)
        });
    
    });
    
}


// when the GUI is ready to send data to browsers
ipcMain.on('sendData', (event, data) => {
    sockets.forEach(socket => {
        socket.send(data)
    })
})


// create window on startup
app.whenReady().then(() => {
    createWindow()
});

// close electron when all windows close (for Windows and Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

// todo close electron for mac, if there ever is support for it that is
