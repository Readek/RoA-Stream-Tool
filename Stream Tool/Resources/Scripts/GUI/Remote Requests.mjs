import { replaceBracket } from "./Bracket.mjs";
import { commFinder } from "./Finder/Comm Finder.mjs";
import { playerFinder } from "./Finder/Player Finder.mjs";
import { displayNotif } from "./Notifications.mjs";
import { updateGUI } from "./Remote Update.mjs";
import { settings } from "./Settings.mjs";
import { changeUpdateText, writeScoreboard } from "./Write Scoreboard.mjs";

let webSocket;
const updateRegion = document.getElementById('updateRegion');

export function startWebsocket() {
    
    changeUpdateText("RECONNECTING");
    // remove the reconnect click listener
    updateRegion.removeEventListener("click", startWebsocket);
    
	// we need to connect to the websocket server
	webSocket = new WebSocket("ws://"+window.location.hostname+":8080?id=remoteGUI");
	webSocket.onopen = () => { // if it connects successfully
        
        // everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			getData(JSON.parse(event.data));
		}

        // request current data to the GUI
        sendRemoteData({message: "RemoteRequestData"});

	}

	// if the connection closes
	webSocket.onclose = () => {errorWebsocket()};

}
function errorWebsocket() {

    // show error message
    displayNotif("Connection error, please reconnect.");
    // delete current websocket
    webSocket = null;
    // change the update button to a reconnect buttion
    changeUpdateText("RECONNECT");
    updateRegion.removeEventListener("click", writeScoreboard);
    updateRegion.addEventListener("click", startWebsocket);

}

async function getData(data) {

    if (data.gamemode) { // if this is a GUI update
        
        await updateGUI(data);
        changeUpdateText("UPDATE");
        updateRegion.addEventListener("click", writeScoreboard)

    } else if (data.message == "updatePresets") {

        playerFinder.setPlayerPresets();
        commFinder.setCasterPresets();

    } else if (data.message == "toggleWs") {

        settings.toggleWs();

    } else if (data.GrandFinals) { // if this is bracket data

        replaceBracket(data);

    }

}

export function sendRemoteData(data) {
    webSocket.send(JSON.stringify(data, null, 2));
}