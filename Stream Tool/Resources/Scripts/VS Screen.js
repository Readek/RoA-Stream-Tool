import { fadeIn } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current, maxSides } from "./Utils/Globals.mjs";
import { resizeText } from "./Utils/Resize Text.mjs";
import { updateText } from "./Utils/Update Text.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";
import { bestOf } from "./VS Screen/BestOf.mjs";
import { casters } from "./VS Screen/Caster/Casters.mjs";
import { gamemodeClass } from "./VS Screen/Gamemode Change.mjs";
import { players } from "./VS Screen/Player/Players.mjs";
import { roundInfo } from "./VS Screen/Round Info/Round Info.mjs";
import { teams } from "./VS Screen/Team/Teams.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "./VS Screen/VsGlobals.mjs";

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})


//to avoid the code constantly running the same method over and over
const scorePrev = [], colorPrev = [];


//next, global variables for the html elements
const scoreImg = document.getElementsByClassName("scoreTick");
const scoreNums = document.getElementsByClassName("scoreNum");
const scoreOverlay = document.getElementById("scores");


// start the connection to the GUI so everything gets
// updated once the GUI sends back some data
initWebsocket("gameData", (data) => updateData(data));


/**
 * Updates all displayed data
 * @param {Object} data - All data related to the VS Screen
 */
function updateData(data) {

	const color = data.color;
	const score = data.score;

	// first of all, things that will always happen on each cycle

	// if this isnt a singles match, rearrange stuff
	gamemodeClass.change(data.gamemode);

	// depending on best of, show or hide some score ticks
	bestOf.update(data.bestOf);

	// update that player data (names, info, characters, backgrounds)
	players.update(data.player);

	// update everything related to teams (names, score, color)
	teams.update(data.teamName, data.color, data.score);

	// now, things that will happen only the first time the html loads
	if (current.startup) {

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

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

		for (let i = 0; i < maxSides; i++) {

			//color change, this is up here before char/skin change so it doesnt change the
			//trail to the next one if the character has changed, but it will change its color
			if (colorPrev[i] != color[i].name) {
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
