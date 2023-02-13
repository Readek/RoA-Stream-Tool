'use strict';

let bracketData;
let playerData = [];
const playerSize = '28px';
const tagSize = '16px';
const fadeOutTime = .3;
const fadeInTime = .3;
let webSocket;

class BracketPlayer {

    constructor(round, pos) {

        this.round = round;
        this.pos = pos;
        this.char;
        this.skin;

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
            this.updateName();
        }

        // score update
        if (this.scoreEl.innerHTML !== bracketData[this.round][this.pos].score) {
            this.updateScore();
        }

        // character update
        if (this.char != bracketData[this.round][this.pos].character &&
        this.skin != bracketData[this.round][this.pos].skin) {
            this.updateChar();
        }
        
    }

    updateName() {
        
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

    updateScore() {

        this.scoreEl.innerHTML = bracketData[this.round][this.pos].score;
        this.updateScoreColor();

        // this will activate text recolor for the other player
        const rivalEncounter = this.pos % 2 ? this.pos-1 : this.pos+1;
        playerData[this.round][rivalEncounter].updateScoreColor();

    }
    updateScoreColor() {
        // makes our code cleaner
        const rivalEncounter = this.pos % 2 ? this.pos-1 : this.pos+1;
        const homeScore = this.scoreEl.innerHTML;
        const awayScore = bracketData[this.round][rivalEncounter].score;

        // if more or less score than the other player
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

    updateChar() {

        fadeOut(this.charEl).then( () => {
            this.charEl.src = bracketData[this.round][this.pos].iconSrc;
            // hide character icon if none
            if (bracketData[this.round][this.pos].character == "None") {
                this.charEl.style.display = "none";
            } else {
                this.charEl.style.display = "block";
            }
            fadeIn(this.charEl);
        });
        this.char = bracketData[this.round][this.pos].character;
        this.skin = bracketData[this.round][this.pos].skin;

    }

};


// and here is where we add all the player references
playerData = {
    "WinnersSemis": [],
    "WinnersFinals" : [],
    "GrandFinals": [],
    "TrueFinals": [],
    "LosersTop8": [],
    "LosersQuarters": [],
    "LosersSemis": [],
    "LosersFinals": [],
}
addBracketPlayer("WinnersSemis", 4);
addBracketPlayer("WinnersFinals", 2);
addBracketPlayer("GrandFinals", 2);
addBracketPlayer("TrueFinals", 2);
addBracketPlayer("LosersTop8", 4);
addBracketPlayer("LosersQuarters", 4);
addBracketPlayer("LosersSemis", 2);
addBracketPlayer("LosersFinals", 2);
function addBracketPlayer(round, times) {
    for (let i = 0; i < times; i++) {
        playerData[round].push(new BracketPlayer(round, i));
    }
}



// first we will start by connecting with the GUI with a websocket
startWebsocket();
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	webSocket = new WebSocket("ws://localhost:8080?id=bracket");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			updateData(JSON.parse(event.data));
		}
		// hide error message in case it was up
		document.getElementById('connErrorDiv').style.display = 'none';
	}

	// if the connection closes, wait for it to reopen
	webSocket.onclose = () => {errorWebsocket()}

}
function errorWebsocket() {

	// show error message
	document.getElementById('connErrorDiv').style.display = 'flex';
	// delete current webSocket
	webSocket = null;
	// we will attempt to reconect every 5 seconds
	setTimeout(() => {
		startWebsocket();
	}, 5000);

}


// main loop
async function updateData(data) {

    // actual update
	bracketData = data;
    for (const i of iteratePlayerData()) {
        i.update();
    }

    // if true finals players exist, show true finals round
    if (bracketData["TrueFinals"][0].name != "-" || bracketData["TrueFinals"][1].name != "-") {
        if (window.getComputedStyle(document.getElementById("TrueFinals")).getPropertyValue("display") == "none") {
            document.getElementById("TrueFinals").style.display = "flex";
            resizeText(playerData[8].nameEl);
            resizeText(playerData[9].nameEl);
        }
    } else {
        document.getElementById("TrueFinals").style.display = "none";
    }
    
}
function* iteratePlayerData() {
    for(let key of Object.entries(playerData)) {
        for(let obj of key[1]) {
            yield obj;
        }
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
