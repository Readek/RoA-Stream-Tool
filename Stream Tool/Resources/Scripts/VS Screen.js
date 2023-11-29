import { current } from "./Utils/Globals.mjs";
import { initWebsocket } from "./Utils/WebSocket.mjs";
import { bestOf } from "./VS Screen/BestOf.mjs";
import { casters } from "./VS Screen/Caster/Casters.mjs";
import { gamemode } from "./VS Screen/Gamemode Change.mjs";
import { players } from "./VS Screen/Player/Players.mjs";
import { roundInfo } from "./VS Screen/Round Info/Round Info.mjs";
import { teams } from "./VS Screen/Team/Teams.mjs";

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})

// used to initialize some stuff just once
let firstUpdate = true;

// start the connection to the GUI so everything gets
// updated once the GUI sends back some data
initWebsocket("gameData", (data) => updateData(data));


/**
 * Updates all displayed data
 * @param {Object} data - All data related to the VS Screen
 */
function updateData(data) {

	// there are some things that we want to happen only once
	if (firstUpdate) {

		// initialize the caster class
		casters.initCasters(data.socialNames);

		firstUpdate = false;

	}

	// if this isnt a singles match, rearrange stuff
	gamemode.change(data.gamemode);

	// depending on best of, show or hide some score ticks
	bestOf.update(data.bestOf);

	// update that player data (names, info, characters, backgrounds)
	players.update(data.player);

	// update everything related to teams (names, score, color)
	teams.update(data.teamName, data.color, data.score);

	// update round text
	roundInfo.updateRound(data.round);

	// update tournament text
	roundInfo.updateTournament(data.tournamentName);

	// and update commentators
	casters.updateCasters(data.caster);

	// many modules need to know if we are loading the view up or not
	if (current.startup) {
		current.startup = false;
	}

}
