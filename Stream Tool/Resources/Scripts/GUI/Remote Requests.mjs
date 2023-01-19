import { displayNotif } from "./Notifications.mjs";
import { updateGUI } from "./Remote Update.mjs";
import { writeScoreboard } from "./Write Scoreboard.mjs";

let webSocket;
const updateButtText = document.getElementsByClassName("botText")[0];

startWebsocket();
function startWebsocket() {
    
    updateButtText.textContent = "RECONNECTING";
	// we need to connect to the websocket server
	webSocket = new WebSocket("ws://"+window.location.hostname+":8080?id=remoteGUI");
	webSocket.onopen = () => { // if it connects successfully
        updateButtText.textContent = "UPDATE";
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			getData(JSON.parse(event.data));
		}
	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {
        displayNotif("Connection error, please reconnect.")
        updateButtText.textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
        
    }
	// if connection fails for any reason
	webSocket.onerror = () => {
        displayNotif("Connection error, please reconnect.")
        updateButtText.textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
    }

}


async function getData(data) {
   
    if (data.gamemode) { // check if GUI update
        await updateGUI(data);
    }

}

export function sendRemoteData(data) {
    webSocket.send(data);
}