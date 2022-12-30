// import electron stuff
const fs = require('fs');
const ipc = require('electron').ipcRenderer;

// import local stuff
import * as glob from './GUI/Globals.mjs';
import { getJson } from './GUI/Utils.mjs';
import { viewport } from './GUI/Viewport.mjs';
import { charFinder } from './GUI/Finder/Char Finder.mjs';
import { skinFinder } from './GUI/Finder/Skin Finder.mjs';
import { commFinder } from './GUI/Finder/Comm Finder.mjs';
import { playerFinder } from './GUI/Finder/Player Finder.mjs';
import { players } from './GUI/Players.mjs';
import { PlayerGame } from './GUI/Player/Player Game.mjs';
import { hideBgCharImgs, showBgCharImgs } from './GUI/Player/BG Char Image.mjs';
import { settings } from './GUI/Settings.mjs';
import { currentColors } from './GUI/Colors.mjs';

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

let currentP1WL = "", currentP2WL = "";
let currentBestOf = 5;

let gamemode = 1;

const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk


//preload  e v e r y t h i n g
const pInfoDiv = document.getElementById("pInfoDiv");

const tNameInps = document.getElementsByClassName("teamName");

const scores = [];

const wlButtons = document.getElementsByClassName("wlButtons");
const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const roundInp = document.getElementById('roundName');
const tournamentInp = document.getElementById('tournamentName');

const casters = [];

const forceWL = document.getElementById('forceWLToggle');

const notifSpan = document.getElementById("notifText");


// commentator class
class Caster {

    constructor(el) {

        this.nameEl = el.getElementsByClassName(`cName`)[0];
        this.twitterEl = el.getElementsByClassName(`cTwitter`)[0];
        this.twitchEl = el.getElementsByClassName(`cTwitch`)[0];
        this.ytEl = el.getElementsByClassName(`cYt`)[0];
        this.saveEl = el.getElementsByClassName(`saveCasterButt`)[0];

        // every time we type on name
        this.nameEl.addEventListener("input", () => {

            // check to disable or enable save button
            if (this.getName()) {
                this.saveEl.disabled = false;
            } else {
                this.saveEl.disabled = true;
            }

            // check if theres an existing caster preset
            commFinder.fillFinderPresets(this);

        });

        // if we click on the name text input
        this.nameEl.addEventListener("focusin", () => {
            commFinder.fillFinderPresets(this);
            commFinder.open(this.nameEl.parentElement);
        });
        // hide the presets dropdown if text input loses focus
        this.nameEl.addEventListener("focusout", () => {
            if (!glob.inside.finder) {
                commFinder.hide();
            }
        });

        // every time we click on the save button
        this.saveEl.addEventListener("click", () => {

            // save current info to an object
            const preset = {
                twitter: this.getTwitter(),
                twitch: this.getTwitch(),
                yt: this.getYt()
            };

            // use this object to create a json file
            fs.writeFileSync(`${glob.path.text}/Commentator Info/${this.getName()}.json`, JSON.stringify(preset, null, 2));

            displayNotif("Commentator preset has been saved");
        });

    }

    getName() {
        return this.nameEl.value;
    }
    getTwitter() {
        if (this.twitterEl.value == "") {
            return "-";
        } else {
            return this.twitterEl.value;
        }
    }
    getTwitch() {
        if (this.twitchEl.value == "") {
            return "-";
        } else {
            return this.twitchEl.value;
        }
    }
    getYt() {
        if (this.ytEl.value == "") {
            return "-";
        } else {
            return this.ytEl.value;
        }
    }
    setName(text) {
        this.nameEl.value = text;
    }
    setTwitter(text) {
        this.twitterEl.value = text;
    }
    setTwitch(text) {
        this.twitchEl.value = text;
    }
    setYt(text) {
        this.ytEl.value = text;
    }

}

// yes also a class for score because classes are cool
class Score {

    constructor(el) {

        this.scoreEls = el.getElementsByClassName("scoreCheck");
        this.scoreNumEl = el.getElementsByClassName("scoreCheckN")[0];

        // set the score whenever we click on a score checkbox
        for (let i = 0; i < this.scoreEls.length; i++) {
            this.scoreEls[i].addEventListener("click", () => {

                // if the checkbox we clicked is already checked, uncheck it
                if (this.scoreEls[i].checked) {
                    this.setScore(i+1);
                } else {
                    this.setScore(i);
                }

            });            
        };

    }

    getScore() {

        if (currentBestOf != "X") { // if score ticks are visible

            let result = 0;

            // if a score tick is checked, add +1 to the result variable
            for (let i = 0; i < this.scoreEls.length; i++) {
                if (this.scoreEls[i].checked) {
                    result++;
                }            
            }
    
            return result;

        } else { // if we are using actual numbers

            return Number(this.scoreNumEl.value);
            
        }



    }

    setScore(score) {

        // just for safety, dont let it drop to negative numbers
        let actualScore;
        if (score <= 0) {
            actualScore = 0;
        } else {
            actualScore = score;
        }

        // check ticks below and equal to score, uncheck ticks above score
        for (let i = 0; i < this.scoreEls.length; i++) {
            if (actualScore > i) {
                this.scoreEls[i].checked = true;
            } else {
                this.scoreEls[i].checked = false;
            }            
        }

        this.scoreNumEl.value = actualScore;

    }

    // called whenever we change the "best of" mode
    showBo5() {
        for (let i = 0; i < this.scoreEls.length; i++) {
            this.scoreEls[i].style.display = "block";            
        }
        this.scoreNumEl.style.display = "none";
    }
    showBo3() {
        this.scoreEls[2].style.display = "none";
    }
    showBoX() {
        for (let i = 0; i < this.scoreEls.length; i++) {
            this.scoreEls[i].style.display = "none";            
        }
        this.scoreNumEl.style.display = "block";
    }
    


}


init();
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", () => {viewport.toCenter()});


    // we need to set the current char path
    glob.path.char = settings.isWsChecked() ? glob.path.charWork : glob.path.charBase;


    // initialize our player class
    for (let i = 0; i < maxPlayers; i++) {
        players.push(new PlayerGame(i+1));
    }

    
    // initialize the character list
    charFinder.loadCharacters();


    // initialize that score class
    scores.push(
        new Score(document.getElementById("scoreBox1")),
        new Score(document.getElementById("scoreBox2")),
    );


    //set click listeners for the [W] and [L] buttons
    p1W.addEventListener("click", setWLP1);
    p1L.addEventListener("click", setWLP1);
    p2W.addEventListener("click", setWLP2);
    p2L.addEventListener("click", setWLP2);


    // open player info menu if clicking on the icon
    const pInfoButts = document.getElementsByClassName("pInfoButt");
    for (let i = 0; i < pInfoButts.length; i++) {
        pInfoButts[i].addEventListener("click", showPlayerInfo);
    }
    
    // close player info with the buttons
    document.getElementById("pInfoBackButt").addEventListener("click", hidePlayerInfo);
    document.getElementById("pInfoSaveButt").addEventListener("click", () => {
        applyPlayerInfo();
        savePlayerPreset();
        hidePlayerInfo();
    });
    document.getElementById("pInfoApplyButt").addEventListener("click", () => {
        applyPlayerInfo();
        hidePlayerInfo();
    })


    // set click listeners to change the "best of" status
    document.getElementById("bestOf").addEventListener("click", changeBestOf);


    // check if the round is grand finals whenever we type on round input
    roundInp.addEventListener("input", checkRound);


    //gamemode button
    document.getElementById("gamemode").addEventListener("click", changeGamemode);


    // initialize the commentators
    casters.push(
        new Caster(document.getElementById("caster1")),
        new Caster(document.getElementById("caster2")),
    );


    //add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    //add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);


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
        } else if (pInfoDiv.style.pointerEvents == "auto") { // if player info menu is up
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
        } else if (pInfoDiv.style.pointerEvents == "auto") { // if player info menu is up
            document.getElementById("pInfoBackButt").click();
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => {
        giveWin(0)
        if (settings.isScoreAutoChecked()) {writeScoreboard()};
    });
    Mousetrap.bind('f2', () => {
        giveWin(1)
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


// score hotkeys function
function giveWin(num) {
    
    if (settings.isInvertScoreChecked()) {
        scores[num].setScore(scores[num].getScore()-1);
    } else {
        scores[num].setScore(scores[num].getScore()+1);
    }

}


function setWLP1() {
    if (this == p1W) {
        currentP1WL = "W";
        this.style.color = "var(--text1)";
        p1L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP1WL = "L";
        this.style.color = "var(--text1)";
        p1W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1W.style.backgroundImage = "var(--bg4)";
    }
}
function setWLP2() {
    if (this == p2W) {
        currentP2WL = "W";
        this.style.color = "var(--text1)";
        p2L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP2WL = "L";
        this.style.color = "var(--text1)";
        p2W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2W.style.backgroundImage = "var(--bg4)";
    }
}

function deactivateWL() {
    currentP1WL = "";
    currentP2WL = "";

    const pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}


// when a player info button is clicked
function showPlayerInfo() {
    
    const pNum = this.getAttribute("player") - 1;
    glob.current.player = pNum;

    document.getElementById("pInfoPNum").textContent = pNum + 1;

    // display the current info for this player
    document.getElementById("pInfoInputPronouns").value = players[pNum].pronouns;
    document.getElementById("pInfoInputTag").value = players[pNum].tag;
    document.getElementById("pInfoInputName").value = players[pNum].nameInp.value;
    document.getElementById("pInfoInputTwitter").value = players[pNum].twitter;
    document.getElementById("pInfoInputTwitch").value = players[pNum].twitch;
    document.getElementById("pInfoInputYt").value = players[pNum].yt;

    // give tab index so we can jump from input to input with the keyboard
    document.getElementById("pInfoInputPronouns").setAttribute("tabindex", "0");
    document.getElementById("pInfoInputTag").setAttribute("tabindex", "0");
    document.getElementById("pInfoInputName").setAttribute("tabindex", "0");
    document.getElementById("pInfoInputTwitter").setAttribute("tabindex", "0");
    document.getElementById("pInfoInputTwitch").setAttribute("tabindex", "0");
    document.getElementById("pInfoInputYt").setAttribute("tabindex", "0");

    pInfoDiv.style.pointerEvents = "auto";
    pInfoDiv.style.opacity = 1;
    pInfoDiv.style.transform = "scale(1)";
    viewport.opacity(".25");

}
function hidePlayerInfo() {
    pInfoDiv.style.pointerEvents = "none";
    pInfoDiv.style.opacity = 0;
    pInfoDiv.style.transform = "scale(1.15)";
    viewport.opacity("1");

    document.getElementById("pInfoInputPronouns").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTag").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputName").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTwitter").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTwitch").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputYt").setAttribute("tabindex", "-1");
}
function applyPlayerInfo() {
    
    const pNum = document.getElementById("pInfoPNum").textContent - 1;

    players[pNum].pronouns = document.getElementById("pInfoInputPronouns").value;
    players[pNum].tag = document.getElementById("pInfoInputTag").value;
    players[pNum].nameInp.value = document.getElementById("pInfoInputName").value;
    players[pNum].twitter = document.getElementById("pInfoInputTwitter").value;
    players[pNum].twitch = document.getElementById("pInfoInputTwitch").value;
    players[pNum].yt = document.getElementById("pInfoInputYt").value;

    changeInputWidth(players[pNum].nameInp);

}

function savePlayerPreset() {
    
    const pNum = glob.current.player;

    const preset = {
        name: players[pNum].getName(),
        tag: players[pNum].tag,
        pronouns: players[pNum].pronouns,
        twitter: players[pNum].twitter,
        twitch: players[pNum].twitch,
        yt: players[pNum].yt,
        characters : []

    }
    preset.characters.push({
        character: players[pNum].char,
        skin: players[pNum].skin.name
    });
    if (players[pNum].skin.name == "Custom") {
        preset.characters[0].hex = players[pNum].skin.hex;
    }

    // if a player preset for this player exists, add already existing characters
    if (fs.existsSync(`${glob.path.text}/Player Info/${document.getElementById("pInfoInputName").value}.json`)) {
        
        const existingPreset = getJson(`${glob.path.text}/Player Info/${document.getElementById("pInfoInputName").value}`);
        // add existing characters to the new json, but not if the character is the same
        for (let i = 0; i < existingPreset.characters.length; i++) {
            if (existingPreset.characters[i].character != players[pNum].char) {
                preset.characters.push(existingPreset.characters[i]);
            }
        }

    }

    fs.writeFileSync(`${glob.path.text}/Player Info/${document.getElementById("pInfoInputName").value}.json`, JSON.stringify(preset, null, 2));

    displayNotif("Player preset has been saved");

}


// called when clicking on the "Best of" button
function changeBestOf() {

    if (currentBestOf == 5) {

        currentBestOf = 3;

        // change the visual text
        this.innerHTML = "Best of 3";
        this.title = "Click to change the scoring to Best of X";

        // hide the last score tick from the score ticks
        scores[0].showBo3();
        scores[1].showBo3();

    } else if (currentBestOf == 3) {

        currentBestOf = "X";

        this.innerHTML = "Best of X";
        this.title = "Click to change the scoring to Best of 5";

        scores[0].showBoX();
        scores[1].showBoX();
        

    } else if (currentBestOf == "X") {

        currentBestOf = 5;

        this.innerHTML = "Best of 5";
        this.title = "Click to change the scoring to Best of 3";

        scores[0].showBo5();
        scores[1].showBo5();

    }

}


//for checking if its "Grands" so we make the WL buttons visible
function checkRound() {
    if (!forceWL.checked) {
        if (roundInp.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "flex";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
    }
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
            
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", tNameInps[i-1]);

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

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
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


function swap() {

    //team name
    const teamStore = tNameInps[0].value;
    tNameInps[0].value = tNameInps[1].value;
    tNameInps[1].value = teamStore;

    for (let i = 0; i < maxPlayers; i+=2) {

        //names
        const nameStore = players[i].getName();
        players[i].setName(players[i+1].getName());
        players[i+1].setName(nameStore);

        // player info
        [players[i].tag, players[i+1].tag] = [players[i+1].tag, players[i].tag];
        [players[i].pronouns, players[i+1].pronouns] = [players[i+1].pronouns, players[i].pronouns];
        [players[i].twitter, players[i+1].twitter] = [players[i+1].twitter, players[i].twitter];
        [players[i].twitch, players[i+1].twitch] = [players[i+1].twitch, players[i].twitch];
        [players[i].yt, players[i+1].yt] = [players[i+1].yt, players[i].yt]

        //characters and skins
        const tempP1Char = players[i].char;
        const tempP2Char = players[i+1].char;
        const tempP1Skin = players[i].skin;
        const tempP2Skin = players[i+1].skin;
        // update the stuff
        players[i].charChange(tempP2Char, true);
        players[i+1].charChange(tempP1Char, true);
        players[i].skinChange(tempP2Skin);
        players[i+1].skinChange(tempP1Skin);

    }    

    //scores
    const scoreStore = scores[0].getScore();
    scores[0].setScore(scores[1].getScore());
    scores[1].setScore(scoreStore);

    // [W]/[L] swap
    const previousP1WL = currentP1WL;
    const previousP2WL = currentP2WL;

    if (previousP2WL == "W") {
        p1W.click();
    } else if (previousP2WL == "L") {
        p1L.click();
    }
    if (previousP1WL == "W") {
        p2W.click();
    } else if (previousP1WL == "L") {
        p2L.click();
    }

}

function clearPlayers() {

    //crear the team names
    for (let i = 0; i < tNameInps.length; i++) {
        tNameInps[i].value = "";        
    }

    for (let i = 0; i < maxPlayers; i++) {

        //clear player texts
        players[i].setName("");
        
        // clear player info
        players[i].pronouns = "";
        players[i].tag = "";
        players[i].twitter = "";
        players[i].twitch = "";
        players[i].yt = "";

        //reset characters to random
        players[i].charChange("Random");

    }

    //clear player scores
    for (let i = 0; i < scores.length; i++) {
        scores[i].setScore(0);
    }

}


//time to write it down
function writeScoreboard() {

    //this is what's going to be sent to the browsers
    const scoreboardJson = {
        player: [], //more lines will be added below
        teamName: [
            tNameInps[0].value,
            tNameInps[1].value
        ],
        color: [],
        score: [
            scores[0].getScore(),
            scores[1].getScore()
        ],
        wl: [
            currentP1WL,
            currentP2WL,
        ],
        bestOf: currentBestOf,
        gamemode: gamemode,
        round: roundInp.value,
        tournamentName: tournamentInp.value,
        caster: [],
        allowIntro: document.getElementById('allowIntro').checked,
        // this is just for remote updating
        altSkin: settings.isAltArtChecked(),
        forceHD: settings.isHDChecked(),
        noLoAHD: settings.isNoLoAChecked(),
        workshop: settings.isWsChecked(),
        forceWL: forceWL.checked,
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
        if (!tNameInps[i].value) {
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

    fs.writeFileSync(glob.path.text + "/Simple Texts/Team 1.txt", tNameInps[0].value);
    fs.writeFileSync(glob.path.text + "/Simple Texts/Team 2.txt", tNameInps[1].value);

    fs.writeFileSync(glob.path.text + "/Simple Texts/Score L.txt", scores[0].getScore().toString());
    fs.writeFileSync(glob.path.text + "/Simple Texts/Score R.txt", scores[1].getScore().toString());

    fs.writeFileSync(glob.path.text + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(glob.path.text + "/Simple Texts/Tournament Name.txt", tournamentInp.value);

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Name.txt", casters[i].getName());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Twitter.txt", casters[i].getTwitter());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Twitch.txt", casters[i].getTwitch());
        fs.writeFileSync(glob.path.text + "/Simple Texts/Caster "+(i+1)+" Youtube.txt", casters[i].getYt());
    }

}


// whenever we need to display some info text to the user
function displayNotif(text) {
    
    notifSpan.innerHTML = text;

    notifSpan.style.animation = "";
    setTimeout(() => {
        notifSpan.style.animation = "notifAnim 2.5s both";
    });

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
