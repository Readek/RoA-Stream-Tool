const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const http = require('http');


// define the main folder
let resourcesPath;
if (process.platform == "win32") { // if on Windows
    resourcesPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources')
} else { // if on Linux
    resourcesPath = path.resolve('.', 'Resources')
}
// if using npm/yarn start
/* resourcesPath = path.resolve('..', 'Stream Tool', 'Resources') */

// get some settings from our save
let httpPort, wsPort, guiWidth, guiHeight, failed;
try {
    const guiSettings = JSON.parse(fs.readFileSync(resourcesPath + "/Texts/GUI Settings.json"))
    httpPort = guiSettings.remoteUpdatePort
    wsPort = guiSettings.webSocketPort
    guiWidth = guiSettings.guiWidth
    guiHeight = guiSettings.guiHeight
    if (process.platform == "win32") {
        guiHeight = guiHeight + 29 // windows why cant you be normal
    }

} catch (e) { // if the settings file cant be found
    console.log("GUI Settings.json could not be found!!");
    failed = true
    httpPort = 7070;
    wsPort = 8080;
    guiWidth = 600
    guiHeight = 300
}


// start an http server on boot for remote update
http.createServer((request, response) => {
    if (request.method === "GET") {
        let fname;
        if (request.url == "/") { // main remote update page
            fname = resourcesPath + "/GUI.html";
        } else { // every other request will just send the file
            fname = resourcesPath + request.url;
        }
        try {
            fname = fname.replaceAll("%20", " ");
            fs.readFile(fname, (err, data) => {
                if (err) {
                    response.writeHead(404);
                    response.end();
                } else {
                    if (fname.endsWith(".html")) {
                        response.writeHead(200, {'Content-Type': 'text/html'})
                    } else if (fname.endsWith(".js") || fname.endsWith(".mjs")) {
                        response.writeHead(200, {'Content-Type': 'text/javascript'})
                    } else if (fname.endsWith(".css")) {
                        response.writeHead(200, {'Content-Type': 'text/css'})
                    } else {
                        response.writeHead(200, {'Content-Type': 'text'})
                    }
                    response.write(data)
                    response.end();
                }
            });
        } catch (e) {
            response.writeHead(404);
            response.end();
        }
    }
}).listen(httpPort)


// start a web socket server on boot
const server = new WebSocket.Server({ port: wsPort });
let sockets = [];


function createWindow() {

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

    server.on('connection', (socket, req) => {


        // add this new connection to the array to keep track of them
        sockets.push({ws: socket, id: req.url.substring(5)})
    
        // when a new client connects, send current data
        win.webContents.send('requestData')
    
        // when a socket closes, or disconnects, remove it from the array.
        socket.on('close', function() {
            sockets = sockets.filter(s => s.ws !== socket)
        });

        // in case we get data externally, pass it to the GUI
        socket.on("message", data => {
            win.webContents.send('remoteGuiData', `${data}`)
        })
    
    });
    
}


// when the GUI is ready to send data to browsers
ipcMain.on('sendData', (event, data) => {
    sockets.forEach(socket => {
        if (JSON.parse(data).id == socket.id) {
            socket.ws.send(data)
        }
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
