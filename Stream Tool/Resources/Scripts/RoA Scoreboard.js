import { gamemode } from "./Scoreboard/Gamemode Change.mjs";
import { scoreboardIntro } from "./Scoreboard/Intro.mjs";
import { players } from "./Scoreboard/Player/Players.mjs";
import { round } from "./Scoreboard/Round.mjs";
import { fadeInTimeSc, fadeOutTimeSc, introDelaySc } from "./Scoreboard/ScGlobals.mjs";
import { teams } from "./Scoreboard/Team/Teams.mjs";
import { fadeIn, fadeInMove } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current } from "./Utils/Globals.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";

//to avoid the code constantly running the same method over and over
const wlPrev = [];
let bestOfPrev, gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;


let startup = true;


//next, global variables for the html elements
const scoreboard = document.getElementsByClassName("scoreboard");
const teamNames = document.getElementsByClassName("teamName");
const topBars = document.getElementsByClassName("topBarTexts");
const scoreNums = document.getElementsByClassName("scoreNum");
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
		/* updateScore(score[0], bestOf, color[0], 0, gamemode.getGm(), false);
		updateScore(score[1], bestOf, color[1], 1, gamemode.getGm(), false); */
	}

	// now, things that will happen only once, when the html loads
	if (startup) {

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			// to know animation direction
			const side = (i % 2 == 0) ? true : false;

			// fade in move the scoreboards
			fadeInMove(scoreboard[i].parentElement, null, side, current.delay-.1);
			
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

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
				/* updateScore(score[i], bestOf, color[i], i, gamemode.getGm(), false); */
			}
			gamemodePrev = gamemode.getGm();
		}

		//now let's check stuff from each side
		for (let i = 0; i < maxSides; i++) {

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
