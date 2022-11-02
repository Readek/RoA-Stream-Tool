'use strict';

const bRoundSelect = document.getElementById('bracketRoundSelect');
const bEncountersDiv = document.getElementById('bracketEncounters');

// just the initial state of the bracket
const blankPlayerData = {
    name: "-",
    tag: "",
    character: "-",
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


class BracketPlayer {

    constructor(id) {

        this.pNum = id;
        this.nameInp;
        this.tagInp;
        this.charSel;
        this.skinSel;
        this.charDiv = this.createCharDiv();

        this.char = "";
        this.skin = "";
        this.charInfo;
        this.iconSrc = "";
        this.iconBrowserSrc;

        this.scoreInp;

        // set listeners that will trigger when character or skin changes
        this.charSel.addEventListener("click", (e) => {openCharSelector(this.charSel, id)});
        this.skinSel.addEventListener("click", (e) => {
                openSkinSelector(id);
        });

    }

    getName() {
        return this.nameInp.value;
    }
    setName(name) {
        this.nameInp.value = name == "-" ? "" : name;
    }
    getTag() {
        return this.tagInp.value;
    }
    setTag(tag) {
        this.tagInp.value = tag;
    }
    getScore() {
        return this.scoreInp.value;
    }
    setScore(score) {
        this.scoreInp.value = score == "-" ? "" : score;
    }

    createCharDiv() {

        // main div
        const charDiv = document.createElement('div');
        charDiv.className = "charSelects";

        // for the character list
        const cFinderPositionDiv = document.createElement('div');
        cFinderPositionDiv.className = "cFinderPosition";
        charDiv.appendChild(cFinderPositionDiv);

        // actual character button
        const charSelectorDiv = document.createElement('div');
        charSelectorDiv.className = "selector charSelector";
        charSelectorDiv.setAttribute("tabindex", "-1");
        this.charSel = charSelectorDiv;
        cFinderPositionDiv.appendChild(charSelectorDiv);

        // character icon
        const charSelectorIconImg = document.createElement('img');
        charSelectorIconImg.className = "charSelectorIcon";
        charSelectorIconImg.setAttribute("alt", "");
        charSelectorDiv.appendChild(charSelectorIconImg);

        // character text
        const charSelectorTextDiv = document.createElement('div');
        charSelectorTextDiv.className = "charSelectorText";
        charSelectorDiv.appendChild(charSelectorTextDiv);

        // for the skin list
        const cFinderPositionSkinDiv = document.createElement('div');
        cFinderPositionSkinDiv.className = "cFinderPosition";
        charDiv.appendChild(cFinderPositionSkinDiv);

        // actual skin button
        const skinSelectorDiv = document.createElement('div');
        skinSelectorDiv.className = "selector skinSelector";
        skinSelectorDiv.setAttribute("tabindex", "-1");
        this.skinSel = skinSelectorDiv;
        cFinderPositionDiv.appendChild(skinSelectorDiv);

        return charDiv;

    }

    async charChange(character, notDefault) {

        if (character == "-" || character == "Random") {
            character = "None"
        }
        this.char = character;

        // update character selector text
        this.charSel.children[1].innerHTML = character;

        // set the skin list for this character
        this.charInfo = getJson(`${charPath}/${character}/_Info`);

        // if the character doesnt exist, write in a placeholder
        if (this.charInfo === null) {
            this.charInfo = {
                skinList : [{name: "Default"}],
                gui : []
            }
        }

        // set the skin variable from the skin list
        this.skin = this.charInfo.skinList[0];

        // if there's only 1 skin, dont bother displaying skin selector
        if (this.charInfo.skinList.length > 1) {
            this.skinSel.style.display = "flex";
        } else {
            this.skinSel.style.display = "none";
        }

        // if we are changing both char and skin, dont show default skin
        if (!notDefault) {
            this.skinChange(this.skin);
        }

    }

    async skinChange(skin) {

        // remove focus from the skin list so it auto hides
        document.activeElement.blur();

        this.skin = skin;

        // update the text of the skin selector
        this.skinSel.innerHTML = skin.name;

        // check if an icon for this skin exists, recolor if not
        this.iconSrc = await this.getRecolorImage(
            this.char,
            skin,
            this.charInfo.ogColor,
            this.charInfo.colorRange,
            "Icons/",
            "Icon"
        );
        this.charSel.children[0].src = this.iconSrc;
        this.iconBrowserSrc = this.getBrowserSrc(this.char, skin);

    }

    async fillSkinList() {

        const skinImgs = [];

        // for every skin on the skin list, add an entry
        for (let i = 0; i < this.charInfo.skinList.length; i++) {
            
            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {this.skinChange(this.charInfo.skinList[i])});
            
            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = this.charInfo.skinList[i].name;
            spanName.className = "pfName";

            // add them to the div we created before
            newDiv.appendChild(spanName);

            // now for the character image, this is the mask/mirror div
            const charImgBox = document.createElement("div");
            charImgBox.className = "pfCharImgBox";

            // actual image
            const charImg = document.createElement('img');
            charImg.className = "pfCharImg";
            skinImgs.push(charImg);
            
            // we have to position it
            positionChar(this.charInfo.skinList[i].name, charImg, {gui: this.charInfo.gui});
            // and add it to the mask
            charImgBox.appendChild(charImg);

            //add it to the main div
            newDiv.appendChild(charImgBox);

            // and now add the div to the actual GUI
            skinFinder.lastElementChild.appendChild(newDiv);

        }

        // now add a final entry for custom skins
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {showCustomSkin(this.pNum)});
        const spanName = document.createElement('span');
        spanName.innerHTML = "Custom Skin";
        spanName.className = "pfName";
        spanName.style.color = "lightsalmon"
        newDiv.appendChild(spanName);
        skinFinder.lastElementChild.appendChild(newDiv);

        // add them images to each entry and recolor them if needed
        for (let i = 0; i < skinImgs.length; i++) {
            if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "none") {
                break;
            }
            const finalSrc = await this.getRecolorImage(
                this.char,
                this.charInfo.skinList[i],
                this.charInfo.ogColor,
                this.charInfo.colorRange,
                "Skins/",
                "P2"
            );
            skinImgs[i].setAttribute('src', finalSrc);
        }

    }

    // checks if the image for that skin exists, recolors Default if not
    async getRecolorImage(char, skin, colIn, colRan, extraPath, failPath) {
        if (fs.existsSync(`${charPath}/${char}/${extraPath}${skin.name}.png`) && !skin.force) {
            return `${charPath}/${char}/${extraPath}${skin.name}.png`;
        } else if (fs.existsSync(`${charPath}/${char}/${extraPath}Default.png`)) {
            if (skin.hex) {
                return await getRoARecolor(
                    char,
                    `${charPath}/${char}/${extraPath}Default.png`,
                    colIn,
                    colRan,
                    skin.hex,
                    skin.ea,
                    skin.alpha,
                    skin.golden
                );
            } else {
                return `${charPath}/${char}/${extraPath}Default.png`;
            }
        } else {
            return `${charPathRandom}/${failPath}.png`;
        }
    }

    getBrowserSrc(char, skin) {
        let browserCharPath = "Resources/Characters";
        if (workshopCheck.checked) {
            browserCharPath = "Resources/Characters/_Workshop";
        }
        
        if (fs.existsSync(`${charPath}/${char}/Icons/${skin.name}.png`) && !skin.force) {
            return browserCharPath + `/${char}/Icons/${skin.name}.png`;
        } else if (fs.existsSync(`${charPath}/${char}/Icons/Default.png`)) {
            if (skin.hex) {
                return null;
            } else {
                return browserCharPath + `/${char}/Icons/Default.png`;
            }
        } else {
            return `${charPathRandom}/Icon.png`;
        }
    }

}

let bracketPlayers = [];

// its always good to listen closely
bRoundSelect.addEventListener("change", createEncounters);
document.getElementById('bracketGoBack').addEventListener("click", () => {
    inBracket = false;
    goBack();
});
document.getElementById('bracketUpdate').addEventListener("click", updateBracket);


/** Creates encounter divs for the bracket section when changing round */
function createEncounters() {

    bEncountersDiv.innerHTML = "";
    bracketPlayers = [];
    
    for (let i = 0; i < bracketData[this.value].length; i++) {

        bracketPlayers.push(new BracketPlayer(i));
        
        // new encounter div
        const newEnc = document.createElement('div');
        newEnc.className = "bEncounter";

        // character select for choosing the icon
        const charSelect = bracketPlayers[i].charDiv;

        // player tag
        const tagInp = document.createElement('input');
        tagInp.classList = "bTagInp bInput textInput";
        tagInp.setAttribute("placeholder", "Tag");
        bracketPlayers[i].tagInp = tagInp;

        // player name
        const nameInp = document.createElement('input');
        nameInp.classList = "bNameInp bInput textInput";
        nameInp.setAttribute("placeholder", "Player Name");
        bracketPlayers[i].nameInp = nameInp;

        // score
        const scoreInp = document.createElement('input');
        scoreInp.classList = "bScoreInp bInput textInput";
        scoreInp.setAttribute("placeholder", "Score");
        bracketPlayers[i].scoreInp = scoreInp;

        // add it all up
        newEnc.appendChild(charSelect);
        newEnc.appendChild(tagInp);
        newEnc.appendChild(nameInp);
        newEnc.appendChild(scoreInp);
        bEncountersDiv.appendChild(newEnc);

        // set the current bracket data
        bracketPlayers[i].setName(bracketData[this.value][i].name);
        bracketPlayers[i].setTag(bracketData[this.value][i].tag);
        bracketPlayers[i].setScore(bracketData[this.value][i].score);
        bracketPlayers[i].charChange(bracketData[this.value][i].character);
        bracketPlayers[i].skinChange(bracketData[this.value][i].skin);
        
    }

}


/** Updates the bracket with current data, then sends it */
function updateBracket() {
    
    // for each encounter currently shown
    for (let i = 0; i < bEncountersDiv.childElementCount; i++) {

        // modify local bracket object with current data
        bracketData[bRoundSelect.value][i] = {
            name : bracketPlayers[i].getName(),
            tag: bracketPlayers[i].getTag(),
            character: bracketPlayers[i].char,
            skin: bracketPlayers[i].skin,
            iconSrc: bracketPlayers[i].iconBrowserSrc || bracketPlayers[i].iconSrc,
            score: bracketPlayers[i].getScore()
        }
     
    }

    // time to send it away
    sendBracket();
    displayNotif("Bracket has been updated");

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
