/** @type {WebSocket} */
let webSocket;

let id = "";
/** @type {({Object}) => {void}} */
let updateFucnt;

const errorDiv = document.getElementById('connErrorDiv');

/**
 * Initializes the connection with the GUI
 * @param {String} id - Browser identifier
 * @param {({Object}) => {void}} functToUse - Data update function
 */
export function initWebsocket(dataType, functToUse) {
    id = dataType;
    updateFucnt = functToUse;
    startWebsocket();
}

/** Connects to the GUI and stays listening */
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	webSocket = new WebSocket(`ws://localhost:8080?id=${id}`);
	webSocket.onopen = () => { // if it connects successfully

		// everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
            
            // use the function from init
            updateFucnt(JSON.parse(event.data));
		
        }

		// hide error message in case it was up
		errorDiv.style.display = 'none';

	}

	// if the connection closes, wait for it to reopen
	webSocket.onclose = () => {errorWebsocket()}

}
function errorWebsocket() {

	// show error message
	errorDiv.style.display = 'flex';
	// delete current webSocket
	webSocket = null;
	// we will attempt to reconect every 5 seconds
	setTimeout(() => {
		startWebsocket();
	}, 5000);

}