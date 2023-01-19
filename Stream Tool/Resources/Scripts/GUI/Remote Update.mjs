import { bestOf } from "./BestOf.mjs";
import { casters } from "./Caster/Casters.mjs";
import { updateColor } from "./Colors.mjs";
import { gamemode } from "./Gamemode Change.mjs";
import { displayNotif } from "./Notifications.mjs";
import { players } from "./Player/Players.mjs";
import { round } from "./Round.mjs";
import { scores } from "./Score/Scores.mjs";
import { settings } from "./Settings.mjs";
import { teams } from "./Team/Teams.mjs";
import { tournament } from "./Tournament.mjs";
import { wl } from "./WinnersLosers.mjs";
import { writeScoreboard } from "./Write Scoreboard.mjs";

/**
 * Updates the entire GUI with values sent remotely
 * @param {Object} data GUI info
 */
export async function updateGUI(data) {

    // set the gamemode and scoremode
    gamemode.changeGamemode(data.gamemode);
    bestOf.setBo(data.bestOf);

    // set the settings
    settings.setIntro(data.allowIntro);
    if (data.altSkin != settings.isAltArtChecked()) {
        settings.setAltArt(data.altSkin);
        await settings.toggleAltArt();
    }
    if (data.forceHD != settings.isHDChecked()) {
        settings.setHD(data.forceHD);
        await settings.toggleHD();
    }
    if (data.noLoAHD != settings.isNoLoAChecked()) {
        settings.setNoLoA(data.noLoAHD);
        await settings.toggleNoLoA();
    }
    if (data.workshop != settings.isWsChecked()) {
        settings.setWs(data.workshop);
        await settings.toggleWs();
    }
    if (data.forceWL != settings.isForceWLChecked()) {
        settings.setForceWL(data.forceWL);
        settings.toggleForceWL();
    }

    // player time
    for (let i = 0; i < players.length; i++) {

        // player info
        players[i].setName(data.player[i].name);
        players[i].setTag(data.player[i].tag);
        players[i].pronouns = data.player[i].pronouns;
        players[i].twitter = data.player[i].twitter;
        players[i].twitch = data.player[i].twitch;
        players[i].yt = data.player[i].yt;

        // player character and skin
        await players[i].charChange(data.player[i].char, true);
        await players[i].skinChange(players[i].findSkin(data.player[i].skin));

    };

    // stuff for each side
    for (let i = 0; i < 2; i++) {
        scores[i].setScore(data.score[i]);
        teams[i].setName(data.teamName[i]);
        await updateColor(i, data.color[i]);
    }

    // round info
    wl.setLeft(data.wl[0]);
    wl.setRight(data.wl[1]);
    round.setText(data.round);
    tournament.setText(data.tournamentName);

    // and finally, casters
    for (let i = 0; i < casters.length; i++) {
        casters[i].setName(data.caster[i].name);
        casters[i].setTwitter(data.caster[i].twitter);
        casters[i].setTwitch(data.caster[i].twitch);
        casters[i].setYt(data.caster[i].yt);
    }

    // write it down
    displayNotif("GUI was remotely updated");
    
}