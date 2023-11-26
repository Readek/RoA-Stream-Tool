import { fadeIn } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current, maxSides } from "./Utils/Globals.mjs";
import { resizeText } from "./Utils/Resize Text.mjs";
import { updateText } from "./Utils/Update Text.mjs";
import { bestOf } from "./VS Screen/BestOf.mjs";
import { casters } from "./VS Screen/Caster/Casters.mjs";
import { gamemodeClass } from "./VS Screen/Gamemode Change.mjs";
import { players } from "./VS Screen/Player/Players.mjs";
import { roundInfo } from "./VS Screen/Round Info/Round Info.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "./VS Screen/VsGlobals.mjs";

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})


//max text sizes (used when resizing back)
const teamSize = 72;

//to avoid the code constantly running the same method over and over
const scorePrev = [], colorPrev = [];

//to consider how many loops will we do
let maxPlayers = 2; //will change when doubles comes

// this will connect us to the GUI
let webSocket;


//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const teamNames = document.getElementsByClassName("teamName");
const pChara = document.getElementsByClassName("chara");
const pChar = document.getElementsByClassName("char");
const pTrail = document.getElementsByClassName("trail");
const scoreImg = document.getElementsByClassName("scoreTick");
const scoreNums = document.getElementsByClassName("scoreNum");
const colorBG = document.getElementsByClassName("colorBG");
const textBG = document.getElementsByClassName("textBG");
const scoreOverlay = document.getElementById("scores");


// first we will start by connecting with the GUI with a websocket
startWebsocket();
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	webSocket = new WebSocket("ws://localhost:8080?id=gameData");
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


async function updateData(data) {

	const player = data.player;
	const teamName = data.teamName;

	const color = data.color;
	const score = data.score;

	const gamemode = data.gamemode;

	// first of all, things that will always happen on each cycle

	// if this isnt a singles match, rearrange stuff
	gamemodeClass.change(gamemode);

	// set the max players depending on singles or doubles
	maxPlayers = gamemodeClass.getGm() == 1 ? 2 : 4;

	// depending on best of, show or hide some score ticks
	bestOf.update(data.bestOf);

	// update that player data (names, info, characters, backgrounds)
	players.update(data.player);

	// now, things that will happen only the first time the html loads
	if (current.startup) {

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			//update team names (if gamemode is not set to singles)
			if (gamemode != 1) {
				updateText(teamNames[i], teamName[i], teamSize);
				resizeText(teamNames[i]);
				fadeIn(teamNames[i], fadeInTimeVs, introDelayVs+.15);
			}

			//set the colors
			updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
			colorPrev[i] = color[i].name;

			//initialize the score ticks
			updateScore(i, score[i], color[i]);
			scorePrev[i] = score[i];

		}


		//if the scores for both sides are 0, hide the thing
		if (score[0] == 0 && score[1] == 0) {
			scoreOverlay.style.opacity = 0;
		}


		//set the round text
		roundInfo.updateRound(data.round);
		//set the tournament text
		roundInfo.updateTournament(data.tournamentName);


		// initialize the caster class
		casters.initCasters(data.socialNames);
		// and update them
		casters.updateCasters(data.caster);


		// next time we run this function, it will skip all we just did
		current.startup = false;

	}

	// now things that will happen every other cycle
	else {

		//of course, check if the gamemode has changed
		//if (gamemodePrev != gamemode) {
			//calling updateColor here so the text background gets added
			for (let i = 0; i < maxSides; i++) {
				updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
			}
		//}


		for (let i = 0; i < maxSides; i++) {

			//color change, this is up here before char/skin change so it doesnt change the
			//trail to the next one if the character has changed, but it will change its color
			if (colorPrev[i] != color[i].name) {
				updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
				colorTrail(pTrail[i], player[i]);
				//if this is doubles, we also need to change the colors for players 3 and 4
				if (gamemode == 2) {
					colorTrail(pTrail[i+2], player[i+2]);
				}
				updateScore(i, score[i], color[i]);
				colorPrev[i] = color[i].name;
			}

			//check if the scores changed
			if (scorePrev[i] != score[i]) {

				//update the thing
				updateScore(i, score[i], color[i]);

				//if the scores for both sides are 0, hide the thing
				if (score[0] == 0 && score[1] == 0) {
					fadeOut(scoreOverlay, fadeOutTimeVs);
				} else if (window.getComputedStyle(scoreOverlay).getPropertyValue("opacity") == 0) {
					fadeIn(scoreOverlay, fadeInTimeVs);
				}

				scorePrev[i] = score[i];

			}

			//did any of the team names change?
			if (gamemode != 1) {
				if (teamNames[i].textContent != teamName[i]) {
					//hide the text before doing anything
					fadeOut(teamNames[i], fadeOutTimeVs).then( () => {
						//update the text while nobody can see it
						updateText(teamNames[i], teamName[i], teamSize);
						resizeText(teamNames[i]);
						//and fade it back to normal
						fadeIn(teamNames[i], fadeInTimeVs);
					});
				}
			}

		}


		//update round text
		roundInfo.updateRound(data.round);

		//update tournament text
		roundInfo.updateTournament(data.tournamentName);


		//update caster info
		casters.updateCasters(data.caster);

	}
}


//score change, pretty simple
function updateScore(side, pScore, pColor) {

	// update the numerical score in case we are showing it
	updateText(scoreNums[side], pScore, 48);
	resizeText(scoreNums[side]);

	//if this is the right side, change the number
	if (side == 1) {
		side = 3;
	}

	if (pScore == 0) {
		scoreImg[side].style.fill = "#414141";
		scoreImg[side+1].style.fill = "#414141";
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 1) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = "#414141";
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 2) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = pColor.hex;
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 3) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = pColor.hex;
		scoreImg[side+2].style.fill = pColor.hex;
	}

}


//color change
function updateColor(gradEL, textBGEL, color, i, gamemode) {

	//change the color gradient image path depending on the color
	gradEL.src = `Resources/Overlay/VS Screen/Grads/${color.name}.png`;

	//same but with the text background
	textBGEL.src = `Resources/Overlay/VS Screen/Text BGs/${gamemode}/${color.name}.png`;
	
	// update the root css color variable
	const r = document.querySelector(':root');
	if (i % 2 == 0) {
		r.style.setProperty("--colorL", color.hex);
	} else {
		r.style.setProperty("--colorR", color.hex);
	}

	// if 2v2, add a background to the name wrapper
	if (gamemode == 2) {
		pWrapper[i].style.backgroundColor = `${color.hex}ff`;
		pWrapper[i+2].style.backgroundColor = `${color.hex}ff`;
	} else {
		pWrapper[i].style.backgroundColor = "";
		pWrapper[i+2].style.backgroundColor = "";
	}

	// change the text shadows for the numerical scores
	scoreNums[i].style.webkitTextStroke = "1px " + color.hex;
	scoreNums[i].style.textShadow = "0px 0px 3px " + color.hex;

}


//character update!
async function updateChar(charInfo, pNum) {

	//store so code looks cleaner later
	const charEL = pChar[pNum];
	const trailEL = pTrail[pNum];

	//change the image path depending on the character and skin
	charEL.src = charInfo.charImg;
	trailEL.src = charInfo.trailImg;

	//to position the character
	const charPos = charInfo.charPos;
	charEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;
	trailEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;

	//to decide scalling
	if (charInfo.skin.includes("HD")) {
		charEL.style.imageRendering = "auto"; // default scalling
		trailEL.style.imageRendering = "auto";
	} else {
		charEL.style.imageRendering = "pixelated"; // pixel art scalling
		trailEL.style.imageRendering = "pixelated";
	}

	// here we will store promises to use later
	const charsLoaded = [];
	//this will make the thing wait till the images are fully loaded
	charsLoaded.push(charEL.decode(),
		trailEL.decode().catch( () => {} ) // if no trail, do nothing
	);
	// this function will send a promise when the images finish loading
	await Promise.all(charsLoaded);

	return [pChara[pNum], trailEL];

}

//this gets called just to change the color of a trail
function colorTrail(trailEL, char) {
	trailEL.src = char.vs.trailImg;
}
