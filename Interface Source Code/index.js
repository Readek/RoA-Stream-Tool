const path = require('path')
const WebSocket = require('ws')

// define the main folder
let resourcesPath;
if (process.platform == "win32") { // if on Windows
    resourcesPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources');
} else { // if on Linux
    resourcesPath = path.resolve('.', 'Resources');
}
// if using npm/yarn start
/* resourcesPath = path.resolve('..', 'Stream Tool', 'Resources') */

loadExecFile();
async function loadExecFile() {
    try {
        const executable = require(resourcesPath + "/Scripts/Executable.js");
        // we pass the WebSocket class because i coudnt figure out a better way to load it there
        // im blaming electron on this one
        executable(resourcesPath, __dirname, WebSocket);
    } catch (error) {
        console.log(error);
    }
}
