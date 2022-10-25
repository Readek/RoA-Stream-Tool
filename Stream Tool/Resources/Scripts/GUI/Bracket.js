'use strict';

const bRoundSelect = document.getElementById('bracketRoundSelect');
const bEncountersDiv = document.getElementById('bracketEncounters');

let bracketData = {
    "WinnersSemis" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "WinnersFinals" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "GrandFinals" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "TrueFinals" : [
        {
            "name" : "",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "LosersTop8" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "LosersQuarters" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "LosersSemis" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    "LosersFinals" : [
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        },
        {
            "name" : "-",
            "tag" : "",
            "character" : "None",
            "score" : "-"
        }
    ],
    id : "bracket"
}


// its always good to listen closely
bRoundSelect.addEventListener("change", createEncounters);
document.getElementById('bracketGoBack').addEventListener("click", goBack);
document.getElementById('bracketUpdate').addEventListener("click", updateBracket);


/** Creates encounter divs for the bracket section when changing round */
function createEncounters() {

    bEncountersDiv.innerHTML = "";
    
    for (let i = 0; i < bracketData[this.value].length; i++) {
        
        // new encounter div
        const newEnc = document.createElement('div');
        newEnc.className = "bEncounter";

        // player name
        const nameInp = document.createElement('input');
        nameInp.classList = "bNameInp bInput";
        nameInp.setAttribute("placeholder", "Player Name");

        // player tag
        const tagInp = document.createElement('input');
        tagInp.classList = "bTagInp bInput";
        tagInp.setAttribute("placeholder", "Player Tag");

        // character
        const charInp = document.createElement('input');
        charInp.classList = "bCharInp bInput";
        charInp.setAttribute("placeholder", "Character");

        // skin
        const skinInp = document.createElement('input');
        skinInp.classList = "bSkinInp bInput";
        skinInp.setAttribute("placeholder", "Skin");

        // score
        const scoreInp = document.createElement('input');
        scoreInp.classList = "bScoreInp bInput";
        scoreInp.setAttribute("placeholder", "Score");

        // add it all up
        newEnc.appendChild(nameInp);
        newEnc.appendChild(tagInp);
        newEnc.appendChild(charInp);
        newEnc.appendChild(skinInp);
        newEnc.appendChild(scoreInp);
        bEncountersDiv.appendChild(newEnc);
        
    }

}


/** Updates the bracket with current data, then sends it */
function updateBracket() {
    
    // for each encounter currently shown
    for (let i = 0; i < bEncountersDiv.childElementCount; i++) {

        // get that data
        const newName = bEncountersDiv.getElementsByClassName("bNameInp")[i].value;
        const newTag = bEncountersDiv.getElementsByClassName("bTagInp")[i].value;
        const newScore = bEncountersDiv.getElementsByClassName("bScoreInp")[i].value;

        // check if the character icon file exists
        let newChar = "None";
        let newCharUrl = bEncountersDiv.getElementsByClassName("bCharInp")[i].value
            + "/Icons/" +
            bEncountersDiv.getElementsByClassName("bSkinInp")[i].value;        
        
        // get us the path used by the browser sources
        let browserCharPath = "Characters";
        if (workshopCheck.checked) {
            browserCharPath = "Characters/_Workshop";
        }
        if (fs.existsSync(`${charPath}/${newCharUrl}.png`)) {
            newChar = newCharUrl
        }

        // modify local bracket object with current data
        modifyBracket(bRoundSelect.value, i, newName, newTag, newChar, newScore);
     
    }

    // time to send it away
    sendBracket();

}


/**
 * Modify the bracket's content one encounter at a time
 * @param {String} round - Round's name (for example: LosersFinals)
 * @param {number} pos - Encounter's position within the round (from 0 to 3)
 * @param {String} name - Player's name
 * @param {String} tag - Player's tag (usually sponsor)
 * @param {String} character - Character img path (example: Maypul/Icons/Default)
 * @param {number} score - Player's score on the current encounter
*/
function modifyBracket(round, pos, name, tag, character, score) {
    
    bracketData[round][pos] = {
        name : name,
        tag : tag,
        character : character,
        score : score
    };

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
