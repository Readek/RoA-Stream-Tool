import { charFinder } from './GUI/Finder/Char Finder.mjs';
import { players } from './GUI/Player/Players.mjs';
import { PlayerGame } from './GUI/Player/Player Game.mjs';
import { settings } from './GUI/Settings.mjs';
import { Caster } from './GUI/Caster.mjs';
import { Score } from './GUI/Score.mjs';
import { scores } from './GUI/Scores.mjs';
import { Team } from './GUI/Team.mjs';
import { teams } from './GUI/Teams.mjs';
import { swapPlayers } from './GUI/Swap Players.mjs'; // so it loads the listener
import { casters } from './GUI/Casters.mjs';
import { writeScoreboard } from './GUI/Write Scoreboard.mjs';
import { loadKeybinds } from './GUI/Keybinds.mjs';
import { updateBracket } from './GUI/Bracket.mjs';
import { stPath } from './GUI/Globals.mjs';

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
function init() {

    // we need to set the current char path
    stPath.char = settings.isWsChecked() ? stPath.charWork : stPath.charBase;


    // initialize our player class
    const pInfoEls = document.getElementsByClassName("playerInfo");
    const cInfoEls = document.getElementsByClassName("charSelects");
    players.push(new PlayerGame(1, pInfoEls[0], cInfoEls[0]));
    players.push(new PlayerGame(2, pInfoEls[2], cInfoEls[2]));
    players.push(new PlayerGame(3, pInfoEls[1], cInfoEls[1]));
    players.push(new PlayerGame(4, pInfoEls[3], cInfoEls[3]));

    
    // initialize the character list
    charFinder.loadCharacters();


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
        new Team(document.getElementsByClassName("side")[0]),
        new Team(document.getElementsByClassName("side")[1]),
    );


    // update the GUI on startup so we have something to send to browsers
    writeScoreboard();
    updateBracket(true);

    // get those keybinds running
    loadKeybinds();

}
