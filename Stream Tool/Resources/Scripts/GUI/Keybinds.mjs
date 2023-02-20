import { updateBracket } from './Bracket.mjs';
import { clear } from './Clear.mjs';
import { charFinder } from './Finder/Char Finder.mjs';
import { commFinder } from './Finder/Comm Finder.mjs';
import { playerFinder } from './Finder/Player Finder.mjs';
import { skinFinder } from './Finder/Skin Finder.mjs';
import { current, inside } from './Globals.mjs';
import { playerInfo } from './Player/Player Info.mjs';
import { playersReady } from './Player/Players.mjs';
import { scores } from './Score/Scores.mjs';
import { settings } from './Settings.mjs';
import { viewport } from './Viewport.mjs';
import { writeScoreboard } from './Write Scoreboard.mjs';

export function loadKeybinds() {

    // enter
    Mousetrap.bind('enter', () => {

        // if a dropdown menu is open, click on the current focus
        if (current.focus > -1) {
            if (playerFinder.isVisible()) {
                playerFinder.getFinderEntries()[current.focus].click();
            } else if (charFinder.isVisible()) {
                charFinder.getFinderEntries()[current.focus].click();
            } else if (skinFinder.isVisible()) {
                skinFinder.getFinderEntries()[current.focus].click();
            } else if (commFinder.isVisible()) {
                commFinder.getFinderEntries()[current.focus].click();
            }
        } else if (playerInfo.isVisible()) { // if player info menu is up
            playerInfo.apply();
            playerInfo.hide();
        } else if (inside.bracket) {
            updateBracket();
        } else {
            // update scoreboard info (updates botBar color for visual feedback)
            if (playersReady()) {
                writeScoreboard();
                document.getElementById('botBar').style.backgroundColor = "var(--bg3)";   
            }
        }

    }, 'keydown');
    // when releasing enter, change bottom bar's color back to normal
    Mousetrap.bind('enter', () => {
        document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
    }, 'keyup');

    // esc
    Mousetrap.bind('esc', () => {
        if (inside.settings || inside.bracket) {
            viewport.toCenter();
        } else if (charFinder.isVisible() || skinFinder.isVisible()
        || commFinder.isVisible() || playerFinder.isVisible()) {
            document.activeElement.blur();
        } else if (playerInfo.isVisible()) { // if player info menu is up
            document.getElementById("pInfoBackButt").click();
        } else {
            clear(); // by default, clear player info
        }
    });

    // F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => {
        scores[0].giveWin();
        if (settings.isScoreAutoChecked()) {writeScoreboard()};
    });
    Mousetrap.bind('f2', () => {
        scores[1].giveWin();
        if (settings.isScoreAutoChecked()) {writeScoreboard()};
    });

    // up/down, to navigate the finders (only when one is shown)
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