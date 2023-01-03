import * as glob from './GUI/Globals.mjs';
import { viewport } from './GUI/Viewport.mjs';
import { charFinder } from './GUI/Finder/Char Finder.mjs';
import { skinFinder } from './GUI/Finder/Skin Finder.mjs';
import { commFinder } from './GUI/Finder/Comm Finder.mjs';
import { playerFinder } from './GUI/Finder/Player Finder.mjs';
import { players } from './GUI/Player/Players.mjs';
import { PlayerGame } from './GUI/Player/Player Game.mjs';
import { settings } from './GUI/Settings.mjs';
import { playerInfo } from './GUI/Player/Player Info.mjs';
import { Caster } from './GUI/Caster.mjs';
import { Score } from './GUI/Score.mjs';
import { scores } from './GUI/Scores.mjs';
import { Team } from './GUI/Team.mjs';
import { teams } from './GUI/Teams.mjs';
import { clearPlayers } from './GUI/Clear Players.mjs';
import { swapPlayers } from './GUI/Swap Players.mjs'; // so it loads the listener
import { casters } from './GUI/Casters.mjs';
import { writeScoreboard } from './GUI/Write Scoreboard.mjs';

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
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", () => {viewport.toCenter()});


    // we need to set the current char path
    glob.path.char = settings.isWsChecked() ? glob.path.charWork : glob.path.charBase;


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


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {

        // if a dropdown menu is open, click on the current focus
        if (glob.current.focus > -1) {
            if (playerFinder.isVisible()) {
                playerFinder.getFinderEntries()[glob.current.focus].click();
            } else if (charFinder.isVisible()) {
                charFinder.getFinderEntries()[glob.current.focus].click();
            } else if (skinFinder.isVisible()) {
                skinFinder.getFinderEntries()[glob.current.focus].click();
            } else if (commFinder.isVisible()) {
                commFinder.getFinderEntries()[glob.current.focus].click();
            }
        } else if (playerInfo.isVisible()) { // if player info menu is up
            document.getElementById("pInfoApplyButt").click();
        } else if (glob.inside.bracket) {
            updateBracket();
        } else {
            //update scoreboard info (updates botBar color for visual feedback)
            writeScoreboard();
            document.getElementById('botBar').style.backgroundColor = "var(--bg3)";
        }

    }, 'keydown');
    //when releasing enter, change bottom bar's color back to normal
    Mousetrap.bind('enter', () => {
        document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
    }, 'keyup');

    //esc to clear player info
    Mousetrap.bind('esc', () => {
        if (glob.inside.settings || glob.inside.bracket) {
            viewport.toCenter();
        } else if (charFinder.isVisible() || skinFinder.isVisible()
        || commFinder.isVisible() || playerFinder.isVisible()) {
            document.activeElement.blur();
        } else if (playerInfo.isVisible()) { // if player info menu is up
            document.getElementById("pInfoBackButt").click();
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => {
        scores[0].giveWin();
        if (settings.isScoreAutoChecked()) {writeScoreboard()};
    });
    Mousetrap.bind('f2', () => {
        scores[1].giveWin();
        if (settings.isScoreAutoChecked()) {writeScoreboard()};
    });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        if (playerFinder.isVisible()) {
            playerFinder.addActive(true);
        } else if (charFinder.isVisible()) {
            charFinder.addActive(true);
        } else if (skinFinder.isVisible()) {
            skinFinder.addActive(true);
        } else if (commFinder.isVisible()) {
            commFinder.addActive(true);
        }
    });
    Mousetrap.bind('up', () => {
        if (playerFinder.isVisible()) {
            playerFinder.addActive(false);
        } else if (charFinder.isVisible()) {
            charFinder.addActive(false);
        } else if (skinFinder.isVisible()) {
            skinFinder.addActive(false);
        } else if (commFinder.isVisible()) {
            commFinder.addActive(false);
        }
    });

}
