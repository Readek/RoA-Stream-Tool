import { inside } from "./Globals.mjs";
import { writeScoreboard } from "./Write Scoreboard.mjs";

let webSocket;

if (!inside.electron) {
    startWebsocket();
}
function startWebsocket() {
    
    document.getElementById("updateButtonText").textContent = "RECONNECTING";
	// we need to connect to the websocket server
	webSocket = new WebSocket("ws://"+window.location.hostname+":8080?id=remoteGUI");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
            document.getElementById("updateButtonText").textContent = "UPDATE";
			getData(JSON.parse(event.data));
		}
	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {
        displayNotif("Connection error, please reconnect.")
        document.getElementById("updateButtonText").textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
        
    }
	// if connection fails for any reason
	webSocket.onerror = () => {
        displayNotif("Connection error, please reconnect.")
        document.getElementById("updateButtonText").textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
    }

}