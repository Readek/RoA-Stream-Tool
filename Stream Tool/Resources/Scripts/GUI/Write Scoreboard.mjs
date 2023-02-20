import { bestOf } from './BestOf.mjs';
import { casters } from './Caster/Casters.mjs';
import { currentColors } from './Colors.mjs';
import { gamemode } from './Gamemode Change.mjs';
import { players, playersReady } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Score/Scores.mjs';
import { settings } from './Settings.mjs';
import { teams } from './Team/Teams.mjs';
import { tournament } from './Tournament.mjs';
import { wl } from './WinnersLosers.mjs';
import { inside } from './Globals.mjs';
import { saveSimpleTexts } from './File System.mjs';

const updateDiv = document.getElementById('updateRegion');
const updateText = updateDiv.getElementsByClassName("botText")[0];
const updateRegion = document.getElementById('updateRegion');

// bottom bar update button
updateDiv.addEventListener("click", writeScoreboard);


/**
 * Warns the user that a player is not ready to update yet
 * @param {Boolean} state - True if ready, false if not
 */
export function readyToUpdate(state) {
    if (state) {
        if (playersReady()) {
            changeUpdateText("UPDATE");
            updateDiv.style.pointerEvents = "auto";
        }
    } else {
        changeUpdateText("LOADING CHARACTERS...");
        updateDiv.style.pointerEvents = "none";
    }
}

/** Changes the text displayed on the update button */
export function changeUpdateText(text) {
    updateText.innerHTML = text;
}

/** Generates an object with game data, then sends it */
export async function writeScoreboard() {

    // if this is a remote browser, display some visual feedback
    if (!inside.electron) {
        changeUpdateText("SENDING DATA...");
        updateRegion.removeEventListener("click", writeScoreboard);
    }

    // this is what's going to be sent to the browsers
    const scoreboardJson = {
        player: [], // more lines will be added below
        teamName: [
            teams[0].getName(),
            teams[1].getName()
        ],
        color: [],
        score: [
            scores[0].getScore(),
            scores[1].getScore()
        ],
        wl: [
            wl.getLeft(),
            wl.getRight(),
        ],
        bestOf: bestOf.getBo(),
        gamemode: gamemode.getGm(),
        round: round.getText(),
        tournamentName: tournament.getText(),
        caster: [],
        allowIntro: settings.isIntroChecked(),
        // this is just for remote updating
        altSkin: settings.isAltArtChecked(),
        forceHD: settings.isHDChecked(),
        noLoAHD: settings.isNoLoAChecked(),
        workshop: settings.isWsChecked(),
        forceWL: settings.isForceWLChecked(),
        id : "gameData"
    };

    //add the player's info to the player section of the json
    for (let i = 0; i < players.length; i++) {

        // finally, add it to the main json
        scoreboardJson.player.push({
            pronouns: players[i].pronouns,
            tag: players[i].tag,
            name: players[i].getName(),
            twitter: players[i].twitter,
            twitch: players[i].twitch,
            yt: players[i].yt,
            sc : {
                charImg: players[i].scBrowserSrc || players[i].scSrc,
                charPos: players[i].getScCharPos(),
            },
            vs : {
                charImg: players[i].vsBrowserSrc || players[i].vsSrc,
                charPos: players[i].getVsCharPos(),
                trailImg: players[i].trailSrc,
                bgVid: players[i].vsBgSrc,
                skin: players[i].vsSkin.name
            },
            // these are just for remote updating
            char: players[i].char,
            skin: players[i].skin.name,
            skinHex: players[i].skinHex,
            customImg: players[i].customImg
        })

    }

    // stuff that needs to be done for both sides
    for (let i = 0; i < 2; i++) {
        // add color info
        scoreboardJson.color.push({
            name: currentColors[i].name,
            hex: currentColors[i].hex
        });
        // if the team inputs dont have anything, display as [Color Team]
        if (!teams[i].getName()) {
            scoreboardJson.teamName[i] = `${currentColors[i].name} Team`
        }
    }

    // do the same for the casters
    for (let i = 0; i < casters.length; i++) {
        scoreboardJson.caster.push({
            name: casters[i].getName(),
            twitter: casters[i].getTwitter(),
            twitch: casters[i].getTwitch(),
            yt: casters[i].getYt(),
        })
    }

    // its time to send the data away
    if (inside.electron) {

        const ipc = await import("./IPC.mjs");
        ipc.updateGameData(JSON.stringify(scoreboardJson, null, 2));
        ipc.sendGameData();
        ipc.sendRemoteGameData();

        //simple .txt files
        saveSimpleTexts();

    } else { // remote update stuff

        const remote = await import("./Remote Requests.mjs");
        scoreboardJson.id = "";
        scoreboardJson.message = "RemoteUpdateGUI";
        remote.sendRemoteData(scoreboardJson);

    }

}
