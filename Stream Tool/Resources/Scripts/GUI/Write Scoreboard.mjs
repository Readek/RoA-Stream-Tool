import { bestOf } from './BestOf.mjs';
import { casters } from './Casters.mjs';
import { currentColors } from './Colors.mjs';
import { gamemode } from './Gamemode Change.mjs';
import { players } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Scores.mjs';
import { settings } from './Settings.mjs';
import { teams } from './Teams.mjs';
import { tournament } from './Tournament.mjs';
import { wl } from './WinnersLosers.mjs';
import { sendGameData, updateGameData } from './IPC.mjs';
import { stPath } from './Globals.mjs';

const fs = require('fs');

// bottom bar update button
document.getElementById('updateRegion').addEventListener("click", () => {
    writeScoreboard();
});

/** Generates an object with game data, then sends it */
export function writeScoreboard() {

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

        // to simplify code
        const charName = players[i].char;
        const charSkin = players[i].skin.name;
        const charVSSkin = players[i].vsSkin.name;
        // get the character position data
        let charPos = players[i].charInfo;

        // get us the path used by the browser sources
        let browserCharPath = "Characters";
        if (settings.isWsChecked()) {
            browserCharPath = "Characters/_Workshop";
        }

        // set data for the scoreboard
        // get the character positions
        let scCharPos = [];
        if (charPos.scoreboard) {
            if (charPos.scoreboard[charSkin]) { // if the skin has a specific position
                scCharPos[0] = charPos.scoreboard[charSkin].x;
                scCharPos[1] = charPos.scoreboard[charSkin].y;
                scCharPos[2] = charPos.scoreboard[charSkin].scale;
            } else if (forceAlt.checked && charPos.scoreboard.alt) { // for workshop alternative art
                scCharPos[0] = charPos.scoreboard.alt.x;
                scCharPos[1] = charPos.scoreboard.alt.y;
                scCharPos[2] = charPos.scoreboard.alt.scale;
            } else { // if none of the above, use a default position
                scCharPos[0] = charPos.scoreboard.neutral.x;
                scCharPos[1] = charPos.scoreboard.neutral.y;
                scCharPos[2] = charPos.scoreboard.neutral.scale;
            }
        } else { // if there are no character positions, set positions for "Random"
            if (i % 2 == 0) {
                scCharPos[0] = 35;
            } else {
                scCharPos[0] = 30;
            }
            scCharPos[1] = -10;
            scCharPos[2] = 1.2;
        }

        // now, basically the same as above, but for the VS
        let vsCharPos = [];
        let vsTrailImg = players[i].trailSrc;
        let vsBG = `${charName}/BG.webm`;
        // get the character positions
        if (charPos.vsScreen) {
            if (charPos.vsScreen[charVSSkin]) { // if the skin has a specific position
                vsCharPos[0] = charPos.vsScreen[charVSSkin].x;
                vsCharPos[1] = charPos.vsScreen[charVSSkin].y;
                vsCharPos[2] = charPos.vsScreen[charVSSkin].scale;
            } else { //if not, use a default position
                vsCharPos[0] = charPos.vsScreen.neutral.x;
                vsCharPos[1] = charPos.vsScreen.neutral.y;
                vsCharPos[2] = charPos.vsScreen.neutral.scale;
            }
        } else { // if there are no character positions, set positions for "Random"
            if (i % 2 == 0) {
                vsCharPos[0] = -475;
            } else {
                vsCharPos[0] = -500;
            }
            //if doubles, we need to move it up a bit
            if (gamemode.getGm() == 2) {
                vsCharPos[1] = -125;
            } else {
                vsCharPos[1] = 0;
            }
            vsCharPos[2] = .8;
        }
        // oh we are still not done here, we need to check the BG
        if (charVSSkin.includes("LoA")) { // show LoA background if the skin is LoA
            vsBG = 'BG LoA.webm';
            browserCharPath = "Characters";
        } else if (charVSSkin == "Ragnir") { // Ragnir shows the default stage in the actual game
            vsBG = 'BG.webm';
            browserCharPath = "Characters";
        } else if (charName == "Shovel Knight" && charVSSkin == "Golden") { // why not
            vsBG = `${charName}/BG Golden.webm`;
        } else if (charPos.vsScreen) { // safety check
            if (charPos.vsScreen["background"]) { // if the character has a specific BG
                vsBG = `${charPos.vsScreen["background"]}/BG.webm`;
            }
        }
        // if it doesnt exist, use a default BG
        if (!fs.existsSync(`${__dirname}/${browserCharPath}/${vsBG}`)) {
            vsBG = "Resources/Characters/BG.webm";
        } else {
            vsBG = `Resources/${browserCharPath}/${vsBG}`;
        }

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
                charPos: scCharPos,
            },
            vs : {
                charImg: players[i].vsBrowserSrc || players[i].vsSrc,
                charPos: vsCharPos,
                trailImg: vsTrailImg,
                bgVid: vsBG,
            },
            // these are just for remote updating
            char: charName,
            skin: charSkin
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
            scoreboardJson.teamName[i] = currentColors[i].name + " Team"
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

    // now convert it into something readable to send to OBS
    updateGameData(JSON.stringify(scoreboardJson, null, 2));
    sendGameData();


    //simple .txt files
    for (let i = 0; i < players.length; i++) {
        fs.writeFileSync(`${stPath.text}/Simple Texts/Player ${i+1}.txt`, players[i].getName());        
    }

    fs.writeFileSync(`${stPath.text}/Simple Texts/Team 1.txt`, teams[0].getName());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Team 2.txt`, teams[1].getName());

    fs.writeFileSync(`${stPath.text}/Simple Texts/Score L.txt`, scores[0].getScore().toString());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Score R.txt`, scores[1].getScore().toString());

    fs.writeFileSync(`${stPath.text}/Simple Texts/Round.txt`, round.getText());
    fs.writeFileSync(`${stPath.text}/Simple Texts/Tournament Name.txt`, tournament.getText());

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Name.txt`, casters[i].getName());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Twitter.txt`, casters[i].getTwitter());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Twitch.txt`, casters[i].getTwitch());
        fs.writeFileSync(`${stPath.text}/Simple Texts/Caster ${i+1} Youtube.txt`, casters[i].getYt());
    }

}
