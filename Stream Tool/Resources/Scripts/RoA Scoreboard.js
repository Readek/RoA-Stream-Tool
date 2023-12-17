import { bestOf } from "./Scoreboard/BestOf.mjs";
import { gamemode } from "./Scoreboard/Gamemode Change.mjs";
import { scoreboardIntro } from "./Scoreboard/Intro.mjs";
import { players } from "./Scoreboard/Player/Players.mjs";
import { round } from "./Scoreboard/Round.mjs";
import { introDelaySc } from "./Scoreboard/ScGlobals.mjs";
import { teams } from "./Scoreboard/Team/Teams.mjs";
import { current} from "./Utils/Globals.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";

// used to initialize some stuff just once
let firstUpdate = true;

// start the connection to the GUI so everything gets
// updated once the GUI sends back some data
initWebsocket("gameData", (data) => updateData(data));


/**
 * Updates all displayed data
 * @param {Object} data - All data related to the VS Screen
 */
async function updateData(data) {

	// update intro data just in case we end up playing it
	scoreboardIntro.updateData(data);

	// this will only happen on view load
	if (current.startup) {

		// before anything else, check if the Intro wants to come out
		if (data.allowIntro) {

			if (firstUpdate) {
				scoreboardIntro.play();
			} else {
				// intro will trigger with the visibilityChange event below
			}

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

	// many modules need to know if we are loading the view up or not
	if (current.startup) {
		current.startup = false;
	}

	if (firstUpdate) {
		firstUpdate = false;
	}

}

// this will trigger every time the browser goes out of view (or back to view)
// on OBS, this triggers when swapping in and out of the scene
// on Chromium (OBS browsers run on it), hide() won't be done until
// the user tabs back, displaying everything for around 1 frame
document.addEventListener("visibilitychange", () => {

	if (document.hidden) { // if lights go out

		current.startup = true;

		// reset animation states for the intro
		scoreboardIntro.reset();

		// hide some stuff so we save on some resources
		players.hide();
		teams.hide();
		round.hide();
	
	} else { // when the user comes back
	
		setTimeout(() => { // i absolutely hate Chromium

			// play that sexy intro
			if (scoreboardIntro.isAllowed()) {
				scoreboardIntro.play();
			}

			// display and animate hidden stuff
			players.show();
			teams.show();
			round.show();

		}, 0);
		
		current.startup = false;
	
	}

});