import { viewport } from './Viewport.mjs';
import { bracketPlayers } from './Player/Players.mjs';
import { PlayerBracket } from "./Player/Player Bracket.mjs";
import { displayNotif } from './Notifications.mjs';


const bRoundSelect = document.getElementById('bracketRoundSelect');
const bEncountersDiv = document.getElementById('bracketEncounters');

// just the initial state of the bracket
const blankPlayerData = {
    name: "-",
    tag: "",
    character: "None",
    skin: "-",
    iconSrc: "",
    score: "-"
}
let bracketData = {
    "WinnersSemis": [blankPlayerData, blankPlayerData, blankPlayerData, blankPlayerData],
    "WinnersFinals": [blankPlayerData, blankPlayerData],
    "GrandFinals" : [blankPlayerData, blankPlayerData],
    "TrueFinals" : [blankPlayerData, blankPlayerData],
    "LosersTop8" : [blankPlayerData, blankPlayerData, blankPlayerData, blankPlayerData],
    "LosersQuarters" : [blankPlayerData, blankPlayerData, blankPlayerData, blankPlayerData],
    "LosersSemis" : [blankPlayerData, blankPlayerData],
    "LosersFinals" : [blankPlayerData, blankPlayerData],
    id : "bracket"
}

let previousRound;


// its always good to listen closely
document.getElementById('botBarBracket').addEventListener("click", () => {viewport.toBracket()});
bRoundSelect.addEventListener("change", createEncounters);
document.getElementById('bracketGoBack').addEventListener("click", () => {viewport.toCenter()});
document.getElementById('bracketUpdate').addEventListener("click", updateBracket);
// force change event for initial creation of encounters
bRoundSelect.dispatchEvent(new Event('change'));


/** Creates encounter divs for the bracket section when changing round */
function createEncounters() {

    // first of all, save current contents to object
    if (bracketPlayers[0]) { // not on the first run
        updateLocalBracket(true);
    }

    bEncountersDiv.innerHTML = "";
    bracketPlayers.length = 0;
    
    for (let i = 0; i < bracketData[this.value].length; i++) {

        bracketPlayers.push(new PlayerBracket(i));
        
        // new encounter div
        const newEnc = document.createElement('div');
        newEnc.className = "bEncounter";

        // character select for choosing the icon
        const charSelect = bracketPlayers[i].charDiv;

        // player tag
        const tagInp = document.createElement('input');
        tagInp.classList = "bTagInp bInput textInput mousetrap";
        tagInp.setAttribute("placeholder", "Tag");
        tagInp.setAttribute("spellcheck", "false");
        bracketPlayers[i].tagInp = tagInp;

        // player name
        const pFinderPos = document.createElement('div');
        pFinderPos.classList = "finderPosition";
        const nameInp = document.createElement('input');
        nameInp.classList = "bNameInp bInput textInput mousetrap";
        nameInp.setAttribute("placeholder", "Player Name");
        nameInp.setAttribute("spellcheck", "false");
        bracketPlayers[i].nameInp = nameInp;
        pFinderPos.appendChild(nameInp);

        // score
        const scoreInp = document.createElement('input');
        scoreInp.classList = "bScoreInp bInput textInput mousetrap";
        scoreInp.setAttribute("placeholder", "Score");
        bracketPlayers[i].scoreInp = scoreInp;

        // add it all up
        newEnc.appendChild(charSelect);
        newEnc.appendChild(tagInp);
        newEnc.appendChild(pFinderPos);
        newEnc.appendChild(scoreInp);

        // set the current bracket data
        bracketPlayers[i].setName(bracketData[this.value][i].name);
        bracketPlayers[i].setTag(bracketData[this.value][i].tag);
        bracketPlayers[i].setScore(bracketData[this.value][i].score);
        bracketPlayers[i].charChange(bracketData[this.value][i].character);
        bracketPlayers[i].skinChange(bracketData[this.value][i].skin);
        bracketPlayers[i].setFinderListeners();

        if (i%2 == 0) {

            // create a new bracket group
            const groupDiv = document.createElement('div');
            groupDiv.classList = "bEncounterGroup";
            bEncountersDiv.appendChild(groupDiv);

            // create that pair container
            const pairDiv = document.createElement('div');
            pairDiv.classList = "bEncounterPair";
            groupDiv.appendChild(pairDiv);

            // add the encounter
            pairDiv.appendChild(newEnc);

            // also add the copy from game button
            const copyFromButt = document.createElement('button');
            copyFromButt.classList = "bCopyGameButt";
            copyFromButt.innerHTML = '<div class="pInfoIconCont"><load-svg src="SVGs/Arrow.svg" class="pInfoIcon"></load-svg></div>'
            copyFromButt.setAttribute("title", "Copy values from current game data");
            copyFromButt.setAttribute("num", i);
            copyFromButt.addEventListener("click", copyFromGameToBracket);
            groupDiv.appendChild(copyFromButt);

        } else {
            // if everything already exists, just append the encounter
            document.getElementsByClassName("bEncounterPair")[Math.floor(i/2)].appendChild(newEnc);
        }
        
    }

    previousRound = bRoundSelect.value;

}


/** Pastes the current game data to the clicked bracket encounter */
function copyFromGameToBracket() {
    
    const num = Number(this.getAttribute("num"));

    for (let i = 0; i < 2; i++) {
        bracketPlayers[num+i].setName(players[i].getName());
        bracketPlayers[num+i].setTag(players[i].tag);
        bracketPlayers[num+i].setScore(scores[i].getScore());
        charChange(players[i].char, num+i, true);
        bracketPlayers[num+i].skinChange(players[i].skin);
    }

}


/** Updates the bracket with current data, then sends it */
function updateBracket() {
    
    // save the current info
    updateLocalBracket();

    // time to send it away
    sendBracket();
    displayNotif("Bracket has been updated");

}

/**
 * Updates the local bracket object without sending it to clients
 * @param {Boolean} previous - To update as previous round data
*/
function updateLocalBracket(previous) {

    const roundToUpdate = previous ? previousRound : bRoundSelect.value;

    // for each encounter currently shown
    for (let i = 0; i < bracketPlayers.length; i++) {
        // modify local bracket object with current data
        bracketData[roundToUpdate][i] = {
            name : bracketPlayers[i].getName() || "-",
            tag: bracketPlayers[i].getTag(),
            character: bracketPlayers[i].char,
            skin: bracketPlayers[i].skin,
            iconSrc: bracketPlayers[i].iconBrowserSrc || bracketPlayers[i].iconSrc,
            score: bracketPlayers[i].getScore() || "-"
        }
    }

}


/** Sends current bracket object to websocket clients */
function sendBracket() {
    ipc.send('sendData', JSON.stringify(bracketData, null, 2));
}

/**
 * Replaces current bracket object with the one recieved remotely
 * @param {Object} newBracket - Data to replace current bracket
*/
function replaceBracket(newBracket) {
    bracketData = newBracket;
    displayNotif("Bracket was remotely updated");
}
