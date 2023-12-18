import { bestOf } from "./BestOf.mjs";
import { addCaster, casters } from "./Caster/Casters.mjs";
import { currentColors, updateColor } from "./Colors.mjs";
import { customChange, setCurrentPlayer } from "./Custom Skin.mjs";
import { gamemode } from "./Gamemode Change.mjs";
import { displayNotif } from "./Notifications.mjs";
import { players } from "./Player/Players.mjs";
import { round } from "./Round.mjs";
import { scores } from "./Score/Scores.mjs";
import { settings } from "./Settings.mjs";
import { teams } from "./Team/Teams.mjs";
import { tournament } from "./Tournament.mjs";
import { wl } from "./WinnersLosers.mjs";

/**
 * Updates the entire GUI with values sent remotely
 * @param {Object} data GUI info
 */
export async function updateGUI(data) {

    // set the gamemode and scoremode
    if (data.gamemode != gamemode.getGm) {
        gamemode.changeGamemode(data.gamemode);
    }
    if (data.bestOf != bestOf.getBo) {
        bestOf.setBo(data.bestOf);
    }

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
    if (data.customRound != settings.isCustomRoundChecked()) {
        settings.setCustomRound(data.customRound);
        settings.toggleCustomRound();
    }
    if (data.forceWL != settings.isForceWLChecked()) {
        settings.setForceWL(data.forceWL);
        settings.toggleForceWL();
    }

    // player time
    for (let i = 0; i < data.player.length; i++) {

        // player info
        players[i].setName(data.player[i].name);
        players[i].setTag(data.player[i].tag);
        players[i].setPronouns(data.player[i].pronouns);
        players[i].setSocials(data.player[i].socials);

        // player character and skin
        if (data.player[i].char != players[i].char || data.player[i].skin != players[i].skin.name) {
            await players[i].charChange(data.player[i].char, true);
            if (data.player[i].customImg) {
                setCurrentPlayer(players[i]);
                await customChange(data.player[i].skinHex, data.player[i].skin);
            } else {
                await players[i].skinChange(players[i].findSkin(data.player[i].skin));
            }
        }

    };

    // stuff for each side
    for (let i = 0; i < 2; i++) {
        if (currentColors[i].name != data.color[i].name) {
            await updateColor(i, data.color[i]);
        }
        scores[i].setScore(data.score[i]);
        teams[i].setName(data.teamName[i]);
    }

    // round info
    round.setText(data.round, data.roundIndex, data.roundNumber);
    round.checkGrands();
    wl.setLeft(data.wl[0]);
    wl.setRight(data.wl[1]);
    tournament.setText(data.tournamentName);

    // commentators!
    const homeCasterLength = casters.length;
    const incCasterLength = data.caster.length;
    // add or remove casters if needed
    if (homeCasterLength < incCasterLength) {
        for (let i = 0; i < incCasterLength - homeCasterLength; i++) {
            addCaster();
        }
    } else if (homeCasterLength > incCasterLength) {
        for (let i = homeCasterLength-1; i > incCasterLength-1; i--) {
            casters[i].delet();            
        }
    }
    // update the actual data
    for (let i = 0; i < casters.length; i++) {
        casters[i].setName(data.caster[i].name);
        casters[i].setPronouns(data.caster[i].pronouns);
        casters[i].setTag(data.caster[i].tag);
        casters[i].setSocials(data.caster[i].socials);
    };

    // write it down
    displayNotif("GUI was remotely updated");
    
}