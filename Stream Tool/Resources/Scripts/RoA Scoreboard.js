import { bestOf } from "./Scoreboard/BestOf.mjs";
import { gamemode } from "./Scoreboard/Gamemode Change.mjs";
import { scoreboardIntro } from "./Scoreboard/Intro.mjs";
import { players } from "./Scoreboard/Player/Players.mjs";
import { round } from "./Scoreboard/Round.mjs";
import { fadeInTimeSc, fadeOutTimeSc, introDelaySc } from "./Scoreboard/ScGlobals.mjs";
import { teams } from "./Scoreboard/Team/Teams.mjs";
import { fadeIn, fadeInMove } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current, maxSides } from "./Utils/Globals.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";

//next, global variables for the html elements
const scoreboard = document.getElementsByClassName("scoreboard");
const teamNames = document.getElementsByClassName("teamName");
const tLogoImg = document.getElementsByClassName("tLogos");

// we want the correct order, we cant use getClassName here
const pTag = [];
function pushArrayInOrder(array, string) {
    for (let i = 0; i < 4; i++) {
        array.push(document.getElementById("p"+(i+1)+string));
    }
}
pushArrayInOrder(pTag, "Tag");


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

	// this will only happen on view load
	if (current.startup) {

		// before anything else, check if the Intro wants to come out
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

	// some score stuff will change depending on Best Of
	bestOf.update(data.bestOf);

	// update players (names, info, characters)
	players.update(data.player);

	// update team info (names, topbar, colors, scores)
	teams.update(data.teamName, data.wl, data.color, data.score);

	// and finally, update the round text
	round.update(data.round);

	if (current.startup) {

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			// to know animation direction
			const side = (i % 2 == 0) ? true : false;

			// fade in move the scoreboards
			fadeInMove(scoreboard[i].parentElement, null, side, current.delay-.1);

			//check if we have a logo we can place on the overlay
			if (gamemode.getGm() == 1) { //if this is singles, check the player tag
				updateLogo(tLogoImg[i], player[i].tag);
			} else { //if doubles, check the team name
				updateLogo(tLogoImg[i], teamName[i]);
			}
			
		}

		current.startup = false;

	}

	// now things that will happen on all the other cycles
	else {

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

function updateLogo(logoEL, nameLogo) {
	logoEL.src = `Resources/Logos/${nameLogo}.png`;
}
