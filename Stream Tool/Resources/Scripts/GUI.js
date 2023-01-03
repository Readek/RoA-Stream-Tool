// import electron stuff
const fs = require('fs');
const ipc = require('electron').ipcRenderer;

// import local stuff
import * as glob from './GUI/Globals.mjs';
import { viewport } from './GUI/Viewport.mjs';
import { charFinder } from './GUI/Finder/Char Finder.mjs';
import { skinFinder } from './GUI/Finder/Skin Finder.mjs';
import { commFinder } from './GUI/Finder/Comm Finder.mjs';
import { playerFinder } from './GUI/Finder/Player Finder.mjs';
import { players } from './GUI/Player/Players.mjs';
import { PlayerGame } from './GUI/Player/Player Game.mjs';
import { hideBgCharImgs, showBgCharImgs } from './GUI/Player/BG Char Image.mjs';
import { settings } from './GUI/Settings.mjs';
import { currentColors } from './GUI/Colors.mjs';
import { round } from './GUI/Round.mjs';
import { wl } from './GUI/WinnersLosers.mjs';
import { tournament } from './GUI/Tournament.mjs';
import { playerInfo } from './GUI/Player/Player Info.mjs';
import { displayNotif } from './GUI/Notifications.mjs';
import { Caster } from './GUI/Caster.mjs';
import { Score } from './GUI/Score.mjs';
import { scores } from './GUI/Scores.mjs';
import { bestOf } from './GUI/BestOf.mjs';
import { Team } from './GUI/Team.mjs';
import { teams } from './GUI/Teams.mjs';
import { clearPlayers } from './GUI/Clear Players.mjs';
import { swapPlayers } from './GUI/Swap Players.mjs'; // so it loads the listener

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

// yes we all like global variables
let scData; // we will store data to send to the browsers here
let gamemode = 1;
const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk
const casters = [];


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


    //gamemode button
    document.getElementById("gamemode").addEventListener("click", changeGamemode);


    // finally, update the GUI on startup so we have something to send to browsers
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


//called when clicking on the gamemode icon, cycles through singles and doubles
function changeGamemode() {

    // store 2v2 only elements
    const dubEls = document.getElementsByClassName("elGm2");

    //things are about to get messy
    if (gamemode == 1) {
        
        gamemode = 2;

        // change gamemode selector text
        this.innerText = "2v2";

        // display all 2v2 only elements
        for (let i = 0; i < dubEls.length; i++) {
            dubEls[i].style.display = "flex";
        }

        //hide the background character image to reduce clutter
        hideBgCharImgs();

        for (let i = 1; i < 3; i++) {
            
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wl.getWLButtons()[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", teams[i-1].getNameInp());

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('pInfo'+i));
        }

        // change max width to the name inputs and char selects
        for (let i = 0; i < maxPlayers; i++) {

            players[i].nameInp.style.maxWidth = "94px"
            
            players[i].charSel.style.maxWidth = "73px";
            players[i].skinSel.style.maxWidth = "72px";

        }

        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to Singles");

        //dropdown menus for the right side will now be positioned to the right
        document.getElementById("dropdownColorR").style.right = "0px";
        document.getElementById("dropdownColorR").style.left = "";

    } else if (gamemode == 2) {

        gamemode = 1;

        // change gamemode selector text
        this.innerText = "1v1";

        // hide all 2v2 only elements
        for (let i = 0; i < dubEls.length; i++) {
            dubEls[i].style.display = "none";
        }

        showBgCharImgs();

        //move everything back to normal
        for (let i = 1; i < 3; i++) {
            document.getElementById('pInfo'+(i+2)).style.display = "none";

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wl.getWLButtons()[i-1]);
            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            document.getElementById("scoreText"+i).style.display = "block";
        
            document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", document.getElementById('pInfo'+i));
        }

        for (let i = 0; i < maxPlayers; i++) {

            players[i].nameInp.style.maxWidth = "210px"
            
            players[i].charSel.style.maxWidth = "141px";
            players[i].skinSel.style.maxWidth = "141px";
            
        }

        this.setAttribute('title', "Change the gamemode to Doubles");

        //dropdown menus for the right side will now be positioned to the left
        document.getElementById("dropdownColorR").style.right = "";
        document.getElementById("dropdownColorR").style.left = "0px";

    }
}


//time to write it down
function writeScoreboard() {

    //this is what's going to be sent to the browsers
    const scoreboardJson = {
        player: [], //more lines will be added below
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
        gamemode: gamemode,
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
    for (let i = 0; i < maxPlayers; i++) {

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
            if (gamemode == 2) {
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

    //do the same for the casters
    for (let i = 0; i < casters.length; i++) {
        scoreboardJson.caster.push({
            name: casters[i].getName(),
            twitter: casters[i].getTwitter(),
            twitch: casters[i].getTwitch(),
            yt: casters[i].getYt(),
        })
    }

    // now convert it into something readable to send to OBS
    scData = JSON.stringify(scoreboardJson, null, 2);
    sendData();


    //simple .txt files
    for (let i = 0; i < maxPlayers; i++) {
        fs.writeFileSync(glob.path.text + "/Simple Texts/Player "+(i+1)+".txt", players[i].getName());        
    }

    fs.writeFileSync(glob.path.text + "/Simple Texts/Team 1.txt", teams[0].getName());
    fs.writeFileSync(glob.path.text + "/Simple Texts/Team 2.txt", teams[1].getName());

    fs.writeFileSync(glob.path.text + "/Simple Texts/Score L.txt", scores[0].getScore().toString());
    fs.writeFileSync(glob.path.text + "/Simple Texts/Score R.txt", scores[1].getScore().toString());

    fs.writeFileSync(glob.path.text + "/Simple Texts/Round.txt", round.getText());
    fs.writeFileSync(glob.path.text + "/Simple Texts/Tournament Name.txt", tournament.getText());

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Name.txt", casters[i].getName());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Twitter.txt", casters[i].getTwitter());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Twitch.txt", casters[i].getTwitch());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Youtube.txt", casters[i].getYt());
    }

}


// when a new browser connects
ipc.on('requestData', () => {
    sendData();
    sendBracket();
})
// every time we need to send data to them browsers
function sendData() {
    ipc.send('sendData', scData);
}

// when we get data remotely, update GUI
ipc.on('remoteGuiData', (event, data) => {

    // parse that json so we get an object we can read
    const newJson = JSON.parse(data);

    // set the gamemode and scoremode
    if (newJson.gamemode == 1) {
        gamemode = 2;
    } else {
        gamemode = 1;
    }
    document.getElementById("gamemode").click();

    if (newJson.bestOf == 5) {
        currentBestOf = "X"
    } else if (newJson.bestOf == 3) {
        currentBestOf = 5
    } else {
        currentBestOf = 3
    }
    document.getElementById("bestOf").click();

    // set the settings
    if (newJson.workshop != wsCheck.checked) {
        if (newJson.workshop) {
            glob.wsCheck.checked = true;
        } else {
            glob.wsCheck.checked = false;
        }
        workshopToggle();
    } else {
        if (newJson.workshop) {
            glob.wsCheck.checked = true;
        } else {
            glob.wsCheck.checked = false;
        }
    }
    if (newJson.altSkin) {
        forceAlt.checked = true;
    } else {
        forceAlt.checked = false;
    }
    if (newJson.allowIntro) {
        document.getElementById("allowIntro").checked = true;
    } else {
        document.getElementById("allowIntro").checked = false;
    }
    if (newJson.forceHD) {
        forceHDCheck.checked = true;
    } else {
        forceHDCheck.checked = false;
    }
    if (newJson.noLoAHD) {
        noLoAHDCheck.checked = true;
    } else {
        noLoAHDCheck.checked = false;
    }
    if (newJson.forceWL != forceWL.checked) {
        if (newJson.forceWL) {
            forceWL.checked = true;
        } else {
            forceWL.checked = false;
        }
        forceWLtoggle();
    } else {
        if (newJson.forceWL) {
            forceWL.checked = true;
        } else {
            forceWL.checked = false;
        }
    }
   
    for (let i = 0; i < newJson.player.length; i++) {

        // player info
        players[i].getName() = newJson.player[i].name;
        players[i].pronouns = newJson.player[i].pronouns;
        players[i].tag = newJson.player[i].tag;
        players[i].twitter = newJson.player[i].twitter;
        players[i].twitch = newJson.player[i].twitch;
        players[i].yt = newJson.player[i].yt;

        // player character and skin
        players[i].charChange(newJson.player[i].char, true);
        players[i].skinChange({name: newJson.player[i].skin});

    };


    for (let i = 0; i < 2; i++) {
        
        // stuff for each side
        scores[i].setScore(newJson.score[i]);
        tNameInps[i].value = newJson.teamName[i];
        updateColor(i, newJson.color[i]);
        
    }

    if (newJson.wl[0] == "W") {p1W.click()};
    if (newJson.wl[0] == "L") {p1L.click()};
    if (newJson.wl[1] == "W") {p2W.click()};
    if (newJson.wl[1] == "L") {p2L.click()};

    roundInp.value = newJson.round;
    tournamentInp.value = newJson.tournamentName;

    for (let i = 0; i < newJson.caster.length; i++) {
        casters[i].setName(newJson.caster[i].name);
        casters[i].setTwitter(newJson.caster[i].twitter == "-" ? "" : newJson.caster[i].twitter);
        casters[i].setTwitch(newJson.caster[i].twitch == "-" ? "" : newJson.caster[i].twitch);
        casters[i].setYt(newJson.caster[i].yt == "-" ? "" : newJson.caster[i].yt);
    }

    // write it down
    writeScoreboard();
    displayNotif("GUI was remotely updated");

});
