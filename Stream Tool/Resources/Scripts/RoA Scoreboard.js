import { gamemode } from "./Scoreboard/Gamemode Change.mjs";
import { scoreboardIntro } from "./Scoreboard/Intro.mjs";
import { players } from "./Scoreboard/Player/Players.mjs";
import { round } from "./Scoreboard/Round.mjs";
import { fadeInTimeSc, fadeOutTimeSc, introDelaySc } from "./Scoreboard/ScGlobals.mjs";
import { teams } from "./Scoreboard/Team/Teams.mjs";
import { fadeIn, fadeInMove } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current } from "./Utils/Globals.mjs";
import { resizeText } from "./Utils/Resize Text.mjs";
import { updateText } from "./Utils/Update Text.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";


//max text sizes (used when resizing back)
const teamSize = 22;
let numSize = 36;

//to avoid the code constantly running the same method over and over
const scorePrev = [], colorPrev = [], wlPrev = [], topBarMoved = [];
let bestOfPrev, gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;


let startup = true;


//next, global variables for the html elements
const scoreboard = document.getElementsByClassName("scoreboard");
const teamNames = document.getElementsByClassName("teamName");
const colorImg = document.getElementsByClassName("colors");
const topBars = document.getElementsByClassName("topBarTexts");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreNums = document.getElementsByClassName("scoreNum");
const scoreAnim = document.getElementsByClassName("scoreVid");
const tLogoImg = document.getElementsByClassName("tLogos");
const borderImg = document.getElementsByClassName('border');

// we want the correct order, we cant use getClassName here
const pTag = [], pProns = [];
function pushArrayInOrder(array, string) {
    for (let i = 0; i < 4; i++) {
        array.push(document.getElementById("p"+(i+1)+string));
    }
}
pushArrayInOrder(pTag, "Tag");
pushArrayInOrder(pProns, "Pronouns");


// start the connection to the GUI so everything gets
// updated once the GUI sends back some data
initWebsocket("gameData", (data) => updateData(data));


/**
 * Updates all displayed data
 * @param {Object} data - All data related to the VS Screen
 */
async function updateData(data) {

	const player = data.player;
	const teamName = data.teamName;

	const color = data.color;
	const score = data.score;
	const wl = data.wl;

	const bestOf = data.bestOf;


	// first of all, things that will always happen on each cycle
	
	// set the max players depending on singles or doubles
	maxPlayers = gamemode.getGm() == 1 ? 2 : 4;

	// now, things that will happen only once, when the html loads
	if (startup) {

		// of course, we have to start with the cool intro stuff
		if (data.allowIntro) {

			// play that intro
			scoreboardIntro.play(data);

			// increase the delay so everything animates after the intro
			current.delay = introDelaySc + 2;

		} else {
			current.delay = introDelaySc;
		}

	}

	// if this isnt a singles match, rearrange stuff
	gamemode.update(data.gamemode);

	// update players (names, info, characters)
	players.update(data.player);

	// update team info (names, topbar, colors, scores)
	teams.update(data.teamName, data.wl, data.color, data.score);

	// and finally, update the round text
	round.update(data.round);

	// change border depending of the Best Of status
	if (bestOfPrev != bestOf) {
		updateBorder(bestOf, gamemode.getGm()); // update the border
		// update the score ticks so they fit the bestOf border
		updateScore(score[0], bestOf, color[0], 0, gamemode.getGm(), false);
		updateScore(score[1], bestOf, color[1], 1, gamemode.getGm(), false);
	}

	// things that will happen for each side
	for (let i = 0; i < maxSides; i++) {

		// change the player background colors
		if (colorPrev[i] != color[i].name) {
			updateColor(colorImg[i], color[i], gamemode.getGm(), scoreNums[i]);
			colorPrev[i] = color[i].name;
		}

	}


	// now, things that will happen only once, when the html loads
	if (startup) {

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			// to know animation direction
			const side = (i % 2 == 0) ? true : false;

			//set the team names if not singles
			if (gamemode.getGm() != 1) {
				updateText(teamNames[i], teamName[i], teamSize);
				resizeText(teamNames[i]);
				fadeInMove(teamNames[i], null, side, current.delay);
			}

			// fade in move the scoreboards
			fadeInMove(scoreboard[i].parentElement, null, side, current.delay-.1);
			
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

			//set the current score
			updateScore(score[i], bestOf, color[i], i, gamemode.getGm(), false);
			scorePrev[i] = score[i];

			//check if we have a logo we can place on the overlay
			if (gamemode.getGm() == 1) { //if this is singles, check the player tag
				updateLogo(tLogoImg[i], player[i].tag);
			} else { //if doubles, check the team name
				updateLogo(tLogoImg[i], teamName[i]);
			}
			
		}

		startup = false; //next time we run this function, it will skip all we just did
		current.startup = false;

	}

	// now things that will happen on all the other cycles
	else {

		//of course, check if the gamemode has changed
		if (gamemodePrev != gamemode.getGm()) {
			//changeGM(gamemodeClass.getGm());
			// we need to update some things
			updateBorder(bestOf, gamemode.getGm());
			for (let i = 0; i < maxSides; i++) {
				updateColor(colorImg[i], color[i], gamemode.getGm(), scoreNums[i]);
				updateScore(score[i], bestOf, color[i], i, gamemode.getGm(), false);
			}
			gamemodePrev = gamemode.getGm();
		}

		//now let's check stuff from each side
		for (let i = 0; i < maxSides; i++) {

			//check if the team names changed
			if (gamemode.getGm() != 1) {

				const side = (i % 2 == 0) ? true : false;

				if (teamNames[i].textContent != teamName[i]) {
					fadeOutMove(teamNames[i], null, side).then( () => {
						updateText(teamNames[i], teamName[i], teamSize);
						resizeText(teamNames[i]);
						fadeInMove(teamNames[i], null, side);
					});
				}
			}

			//score check
			if (scorePrev[i] != score[i]) {
				updateScore(score[i], bestOf, color[i], i, gamemode.getGm(), true);
				scorePrev[i] = score[i];
			}

			//check if we have a logo we can place on the overlay
			if (gamemode.getGm() == 1) { //if this is singles, check the player tag
				if (pTag[i].textContent != player[i].tag) {
					fadeOut(tLogoImg[i], fadeOutTimeSc).then( () => {
						updateLogo(tLogoImg[i], player[i].tag);
						fadeIn(tLogoImg[i], fadeInTimeSc);
					});
				}
			} else { //if doubles, check the team name
				if (teamNames[i].textContent != teamName[i]) {
					fadeOut(tLogoImg[i], fadeOutTimeSc).then( () => {
						updateLogo(tLogoImg[i], teamName[i]);
						fadeIn(tLogoImg[i], fadeInTimeSc);
					});
				}
			}


		}
		
	}

}

// update functions
async function updateScore(pScore, bestOf, pColor, pNum, gamemode, playAnim) {

	if (playAnim) { //do we want to play the score up animation?
		// depending on the color, change the clip
		scoreAnim[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/${pColor.name}.webm`;
		scoreAnim[pNum].play();
	} 
	// change the score image with the new values
	scoreImg[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/Bo${bestOf} ${pScore}.png`;
	// update that score number in case we are using those
	updateText(scoreNums[pNum], pScore, numSize);

}

function updateColor(colorEL, pColor, gamemode, scoreNum) {
	colorEL.src = `Resources/Overlay/Scoreboard/Colors/${gamemode}/${pColor.name}.png`;

	// change the text shadows for the numerical scores
	scoreNum.style.webkitTextStroke = "1px " + pColor.hex;
	scoreNum.style.textShadow = "0px 0px 2px " + pColor.hex;
}

function updateBorder(bestOf, gamemode) {
	for (let i = 0; i < borderImg.length; i++) {
		borderImg[i].src = `Resources/Overlay/Scoreboard/Borders/Border ${gamemode} Bo${bestOf}.png`;
		if (bestOf == "X") {
			scoreNums[i].style.display = "flex";
			
		} else {
			scoreNums[i].style.display = "none";
		}
		if (bestOf == "X" && gamemode == 1) {
			borderImg[i].style.transform = "translateX(-26px)";
			topBars[i].parentElement.parentElement.classList.add("topBarSinglesNum");
		} else {
			borderImg[i].style.transform = "translateX(0px)";
			topBars[i].parentElement.parentElement.classList.remove("topBarSinglesNum");
		}
	}
	bestOfPrev = bestOf
}

function updateLogo(logoEL, nameLogo) {
	logoEL.src = `Resources/Logos/${nameLogo}.png`;
}


//fade out but with movement
async function fadeOutMove(itemID, chara, side) {

	if (chara) {
		// we need to target a different element since chromium
		// does not support idependent transforms on css yet
		itemID.parentElement.style.animation = `charaMoveOut ${fadeOutTimeSc}s both
			,fadeOut ${fadeOutTimeSc}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveOutLeft ${fadeOutTimeSc}s both
				,fadeOut ${fadeOutTimeSc}s both`
			;
		} else {
			itemID.style.animation = `moveOutRight ${fadeOutTimeSc}s both
				,fadeOut ${fadeOutTimeSc}s both`
			;
		}
		
	}
	
	await new Promise(resolve => setTimeout(resolve, fadeOutTimeSc * 1000));

}
