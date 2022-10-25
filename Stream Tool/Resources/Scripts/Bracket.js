'use strict';

let bracketData;
const playerData = [];
const playerSize = '28px';
const tagSize = '16px';
const fadeOutTime = .3
const fadeInTime = .3

class BracketPlayer {

    constructor(round, pos) {

        this.round = round;
        this.pos = pos;

        // assign the html elements to variables
        this.nameEl = document.getElementById(round).getElementsByClassName("playerName")[pos];
        this.tagEl = document.getElementById(round).getElementsByClassName("playerTag")[pos];
        this.charEl = document.getElementById(round).getElementsByClassName("playerIcon")[pos];
        this.scoreEl = document.getElementById(round).getElementsByClassName("score")[pos];
    
    }

    update() {

        // text update
        if (this.nameEl.innerHTML != bracketData[this.round][this.pos].name ||
            this.tagEl.innerHTML != bracketData[this.round][this.pos].tag) {

            fadeOut(this.nameEl.parentElement).then( () => {

				this.nameEl.style.fontSize = playerSize;
                this.nameEl.innerHTML = bracketData[this.round][this.pos].name;
                this.tagEl.style.fontSize = tagSize;
                this.tagEl.innerHTML = bracketData[this.round][this.pos].tag;

                // remove tag from flow if not visible
                if (this.tagEl.innerHTML == "") {
                    this.tagEl.style.display = "none";
                    this.tagEl.parentElement.style.transform = "translate(3px, 0px)";
                } else {
                    this.tagEl.style.display = "block";
                    this.tagEl.parentElement.style.transform = "translate(3px, -3px)";
                }

                resizeText(this.nameEl.parentElement);
				fadeIn(this.nameEl.parentElement);

			});

        }

        // score update
        if (this.scoreEl.innerHTML !== bracketData[this.round][this.pos].score) {

            this.scoreEl.innerHTML = bracketData[this.round][this.pos].score;

            // makes our code cleaner
            const rivalEncounter = this.pos % 2 ? this.pos-1 : this.pos+1;
            const homeScore = this.scoreEl.innerHTML;
            const awayScore = bracketData[this.round][rivalEncounter].score;

            // if more or less score than the other player
            console.log(homeScore);
            if (homeScore == awayScore) {
                this.nameEl.parentElement.style.color = "white";
                this.charEl.style.filter = "grayscale(0)"
            } else if (Number.isFinite(Number(homeScore)) &&
            (homeScore > awayScore || !Number.isFinite(Number(awayScore)))) {
                this.nameEl.parentElement.style.color = "#90ffb1";
                this.charEl.style.filter = "grayscale(0)"
            } else {
                this.nameEl.parentElement.style.color = "#ffa3a3";
                this.charEl.style.filter = "grayscale(1)"
            }

        }

        // character update
        if (!this.charEl.src.includes(bracketData[this.round][this.pos].character)) {
            fadeOut(this.charEl).then( () => {
                this.charEl.src = `Resources/Characters/${bracketData[this.round][this.pos].character}.png`;
                // hide character icon if none
                if (bracketData[this.round][this.pos].character == "None") {
                    this.charEl.style.display = "none";
                } else {
                    this.charEl.style.display = "block";
                }
                fadeIn(this.charEl);
            });
        }
        

    }

};


// and here is where we add all the player references
playerData.push(
    new BracketPlayer("WinnersSemis", 0),
    new BracketPlayer("WinnersSemis", 1),
    new BracketPlayer("WinnersSemis", 2),
    new BracketPlayer("WinnersSemis", 3),
    new BracketPlayer("WinnersFinals", 0),
    new BracketPlayer("WinnersFinals", 1),
    new BracketPlayer("GrandFinals", 0),
    new BracketPlayer("GrandFinals", 1),
    new BracketPlayer("TrueFinals", 0),
    new BracketPlayer("TrueFinals", 1),
    new BracketPlayer("LosersTop8", 0),
    new BracketPlayer("LosersTop8", 1),
    new BracketPlayer("LosersTop8", 2),
    new BracketPlayer("LosersTop8", 3),
    new BracketPlayer("LosersQuarters", 0),
    new BracketPlayer("LosersQuarters", 1),
    new BracketPlayer("LosersQuarters", 2),
    new BracketPlayer("LosersQuarters", 3),
    new BracketPlayer("LosersSemis", 0),
    new BracketPlayer("LosersSemis", 1),
    new BracketPlayer("LosersFinals", 0),
    new BracketPlayer("LosersFinals", 1)
)


// first we will start by connecting with the GUI with a websocket
startWebsocket();
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	const webSocket = new WebSocket("ws://localhost:8080?id=bracket");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
            updateData(JSON.parse(event.data));
		}
		// hide error message in case it was up
		document.getElementById('connErrorDiv').style.display = 'none';
	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {errorWebsocket()}
	// if connection fails for any reason
	webSocket.onerror = () => {errorWebsocket()}

}
function errorWebsocket() {

	// show error message
	document.getElementById('connErrorDiv').style.display = 'flex';
	// we will attempt to reconect every 5 seconds
	setTimeout(() => {
		startWebsocket();
	}, 5000);

}


// main loop
async function updateData(data) {

    // actual update
	bracketData = data;
    for (let i = 0; i < playerData.length; i++) {
        playerData[i].update();
    }

    // if true finals players exist, show true finals round
    if (playerData[8].nameEl.innerText || playerData[9].nameEl.innerText) {
        if (window.getComputedStyle(document.getElementById("TrueFinals")).getPropertyValue("display") == "none") {
            document.getElementById("TrueFinals").style.display = "flex";
            resizeText(playerData[8].nameEl);
            resizeText(playerData[9].nameEl);
        }
    } else {
        document.getElementById("TrueFinals").style.display = "none";
    }
    
}


// text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth) {
		if (childrens.length > 0) { //for tag+player texts
			Array.from(childrens).forEach((child) => {
				child.style.fontSize = getFontSize(child);
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL);
		}
	}
}
// returns a smaller fontSize for the given element
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
}


// animations
async function fadeOut(itemID, dur = fadeOutTime) {
	itemID.style.animation = `fadeOut ${dur}s both`;
	// this function will return a promise when the animation ends
	await new Promise(resolve => setTimeout(resolve, dur * 1000)); // translate to miliseconds
}
function fadeIn(itemID, delay = 0, dur = fadeInTime) {
	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;
}
