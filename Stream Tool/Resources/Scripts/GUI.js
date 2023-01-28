import { charFinder } from './GUI/Finder/Char Finder.mjs';
import { players } from './GUI/Player/Players.mjs';
import { PlayerGame } from './GUI/Player/Player Game.mjs';
import { settings } from './GUI/Settings.mjs';
import { Caster } from './GUI/Caster/Caster.mjs';
import { scores } from './GUI/Score/Scores.mjs';
import { Team } from './GUI/Team/Team.mjs';
import { teams } from './GUI/Team/Teams.mjs';
import './GUI/Swap Players.mjs'; // so it loads the listener
import { casters } from './GUI/Caster/Casters.mjs';
import { writeScoreboard } from './GUI/Write Scoreboard.mjs';
import { loadKeybinds } from './GUI/Keybinds.mjs';
import { updateBracket } from './GUI/Bracket.mjs';
import { inside, stPath } from './GUI/Globals.mjs';
import { Score } from './GUI/Score/Score.mjs';

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
});

// just in case we somehow go out of view
window.onscroll = () => { window.scroll(0, 0) };


init();
/** It all starts here */
async function init() {

    // this will allow us to load functions asynchronously
    const promises = [];

    
    // we need to set the current char path
    await settings.load();
    stPath.char = settings.isWsChecked() ? stPath.charWork : stPath.charBase;


    // initialize our player class
    const pInfoEls = document.getElementsByClassName("playerInfo");
    const cInfoEls = document.getElementsByClassName("charSelects");
    players.push(new PlayerGame(1, pInfoEls[0], cInfoEls[0]));
    players.push(new PlayerGame(2, pInfoEls[2], cInfoEls[2]));
    players.push(new PlayerGame(3, pInfoEls[1], cInfoEls[1]));
    players.push(new PlayerGame(4, pInfoEls[3], cInfoEls[3]));
    // also set an initial character value
    for (let i = 0; i < players.length; i++) {
        promises.push(players[i].charChange("Random"));
    }

    
    // initialize the character list
    promises.push(charFinder.loadCharacters());


    // initialize that score class
    scores.push(
        new Score(document.getElementById("scoreBox1")),
        new Score(document.getElementById("scoreBox2")),
    );


    // initialize the commentators
    casters.push(
        new Caster(document.getElementById("caster1")),
        new Caster(document.getElementById("caster2")),
    );


    // start up those team classes
    teams.push(
        new Team(document.getElementsByClassName("side")[0], 1),
        new Team(document.getElementsByClassName("side")[1], 2),
    );


    // get those keybinds running
    loadKeybinds();

    // when all functions have finished
    await Promise.all(promises);
    // update the GUI on startup so we have something to send to browsers
    if (inside.electron) {
        writeScoreboard();
        updateBracket(true);
    } else { // remote GUIs will ask about the current main GUI state
        const remote = await import("./GUI/Remote Requests.mjs");
        remote.startWebsocket();
    }

}
