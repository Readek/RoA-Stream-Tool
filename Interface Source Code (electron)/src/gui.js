window.onload = init;

const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '..', '..', 'Stream Controller', 'Resources', 'Texts');
const charPath = path.join(__dirname, '..', '..', 'Stream Controller', 'Resources', 'Characters');

const viewport = document.getElementById('viewport');

const navBracket = document.getElementById('nav-bracket');
const navOverlay = document.getElementById('nav-overlay');
const navSettings = document.getElementById('nav-settings');

const p1NameInp = document.getElementById('p1Name');
const p1TagInp = document.getElementById('p1Tag');
const p1ColorList = document.getElementById('p1Color');
const p2NameInp = document.getElementById('p2Name');
const p2TagInp = document.getElementById('p2Tag');
const p2ColorList = document.getElementById('p2Color');

const p1CharList = document.getElementById('p1Char');
const p1SkinList = document.getElementById('p1Skin');
const p2CharList = document.getElementById('p2Char');
const p2SkinList = document.getElementById('p2Skin');

const p1CharImg = document.getElementById('p1CharImg');
const p2CharImg = document.getElementById('p2CharImg');

const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');

const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const roundInp = document.getElementById('roundName');
const tournamentInp = document.getElementById('tournamentName');

const caster1NInp = document.getElementById('cName1');
const caster2NInp = document.getElementById('cName2');

const caster1TInp = document.getElementById('cTwitter1');
const caster2TInp = document.getElementById('cTwitter2');

const updateEL = document.getElementById('updateRegion');

const workshopCheck = document.getElementById('workshopToggle');

function init() {

    //first, add listeners for the top nav bar
    navBracket.addEventListener("click", moveViewport);
    navOverlay.addEventListener("click", moveViewport);
    navSettings.addEventListener("click", moveViewport);

    //move the viewport to the center
    viewport.style.right = "100%";

    
    /* OVERLAY */

    //load the character list on startup
    loadCharacters(p1CharList);
    loadCharacters(p2CharList);

    //set listeners that will trigger when character changes
    p1CharList.addEventListener("change", charChange);
    p2CharList.addEventListener("change", charChange);

    //set listeners that will trigger when skin changes
    p1SkinList.addEventListener("change", skinChange);
    p2SkinList.addEventListener("change", skinChange);

    //check whenever an image isnt found so we replace it with a "?"
    p1CharImg.addEventListener("error", () => {
        p1CharImg.setAttribute('src', charPath + '/' + 'Random/P2.png');
    });
    p2CharImg.addEventListener("error", () => {
        p2CharImg.setAttribute('src', charPath + '/' + 'Random/P2.png');
    });

    //load color slot list
    loadColors(p1ColorList);
    loadColors(p2ColorList);


    /* SETTINGS */

    //set a listener for the workshop check
    workshopCheck.addEventListener("click", workshopChange);


    //whenever clicking the update region, write a new json file
    updateEL.addEventListener("click", writeScoreboard);
}


function moveViewport() {
    if (this == navBracket) {
        viewport.style.right = "0%";
    } else if (this == navOverlay) {
        viewport.style.right = "100%";
        document.getElementById('overlay').style.opacity = "100%";
    } else if (this == navSettings) {
        viewport.style.right = "140%";
        document.getElementById('overlay').style.opacity = "25%";
    }
}


//called whenever we need to read a json file
function getJson(fileName) {
    try {
        let settingsRaw = fs.readFileSync(mainPath + "/" + fileName + ".json");
        return JSON.parse(settingsRaw);
    } catch (error) {
        return undefined;
    }
}


//calls the main settings file and fills a combo list
function loadCharacters(comboList) {
    guiSettings = getJson("InterfaceInfo"); //check the character list
    
    //use the character list to add entries
    if (!workshopCheck.checked) {
        addEntries(comboList, guiSettings.charactersBase);
    } else {
        addEntries(comboList, guiSettings.charactersWorkshop);
    }

    //add random to the end of the list
    let option = document.createElement('option');
    option.text = "Random";
    comboList.add(option);

    //leave it selected
    comboList.selectedIndex = comboList.length - 1;

    //update the image (to random)
    if (comboList == p1CharList) {
        charImgChange(p1CharImg, "Random", undefined);
    } else {
        charImgChange(p2CharImg, "Random", undefined);
    }
}


//called whenever the user changes character
function charChange() {
    const currentChar = this.selectedOptions[0].text; //current selection

    if (this == p1CharList) {
        loadSkins(p1SkinList, currentChar); //load a new skin list
    } else {
        loadSkins(p2SkinList, currentChar);
    }

    let currentSkin;
    //check if skinlist exists first so we dont bug the code later
    try {
        if (this == p1CharList) {
            currentSkin = p1SkinList.selectedOptions[0].text;
        } else {
            currentSkin = p2SkinList.selectedOptions[0].text;
        }
    } catch (error) {
        currentSkin = undefined;
    }

    if (this == p1CharList) {
        charImgChange(p1CharImg, currentChar, currentSkin);
    } else {
        charImgChange(p2CharImg, currentChar, currentSkin);
    }
}

function skinChange() {
    let currentChar;
    if (this == p1SkinList) {
        currentChar = p1CharList.selectedOptions[0].text;
    } else {
        currentChar = p2CharList.selectedOptions[0].text;
    }

    let currentSkin;

    try {
        currentSkin = this.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    if (this == p1SkinList) {
        charImgChange(p1CharImg, currentChar, currentSkin);
    } else {
        charImgChange(p2CharImg, currentChar, currentSkin);
    }
}


//will load the skin list of a given character
function loadSkins(comboList, character) {
    const charInfo = getJson("Character Info/" + character);

    clearList(comboList); //clear the past character's skin list
    if (charInfo != undefined) { //if character doesnt have a list (for example: Random), skip this
        addEntries(comboList, charInfo.skinList); //will add everything on the skin list
    }
}

//will load the color list to a color slot combo box
function loadColors(colorList) {
    guiSettings = getJson("InterfaceInfo"); //check the color list
    
    //use the color list to add entries
    addEntries(colorList, guiSettings.colorSlots)

    //if second player, select the second entry by default
    if (colorList == p2ColorList) {
        colorList.selectedIndex = 1;
    }
}

//will add entries to a combo box with a given array
function addEntries(comboList, list) {
    for (let i = 0; i < list.length; i++) {
        let option = document.createElement('option'); //create new entry
        option.text = list[i]; //set the text of entry
        comboList.add(option); //add the entry to the combo list
    }
}

//deletes all entries of a given combo list
function clearList(comboList) {
    for(let i = comboList.length; i >= 0; i--) {
        comboList.remove(i);
    }
}

//change the image path depending on the character and skin
function charImgChange(charImg, charName, skinName) {
    charImg.setAttribute('src', charPath + '/' + charName + '/' + skinName + '.png');
}

//returns how much score does a player have
function checkScore(tick1, tick2, tick3) {
    let totalScore = 0;

    if (tick1.checked) {
        totalScore++;
    }
    if (tick2.checked) {
        totalScore++;
    }
    if (tick3.checked) {
        totalScore++;
    }

    return totalScore;
}

function checkWL(win, los) {
    if (win.checked) {
        return "Winners";
    } else if (los.checked) {
        return "Losers";
    }
    return "Nada";
}

//returns the round "Best of" status
function checkBo() {
    if (document.getElementById('Bo5Check').checked) {
        return "Bo5";
    }
    return "Bo3";
}


//called whenever the user clicks on the workshop toggle
function workshopChange() {
    //first clear current character lists
    clearList(p1CharList);
    clearList(p2CharList);
    //then reload both character lists
    loadCharacters(p1CharList);
    loadCharacters(p2CharList);
    //dont forget to clear the skin lists
    clearList(p1SkinList);
    clearList(p2SkinList);
}


//time to write it down
function writeScoreboard() {

    //we need to perform this check since the program would halt when reading from undefined
    let p1RealSkin, p2RealSkin;
    try {
        p1RealSkin = p1SkinList.selectedOptions[0].text
    } catch (error) {
        p1RealSkin = "";
    }
    try {
        p2RealSkin = p2SkinList.selectedOptions[0].text
    } catch (error) {
        p2RealSkin = "";
    }

    let scoreboardJson = {
        p1Name: p1NameInp.value,
        p1Team: p1TagInp.value,
        p1Character: p1CharList.selectedOptions[0].text,
        p1Skin: p1RealSkin,
        p1Color: p1ColorList.selectedOptions[0].text,
        p1Score: checkScore(p1Win1, p1Win2, p1Win3),
        p1WL: checkWL(document.getElementById("p1W"), document.getElementById("p1L")),
        p2Name: p2NameInp.value,
        p2Team: p2TagInp.value,
        p2Character: p2CharList.selectedOptions[0].text,
        p2Skin: p2RealSkin,
        p2Color: p2ColorList.selectedOptions[0].text,
        p2Score: checkScore(p2Win1, p2Win2, p2Win3),
        p2WL: checkWL(document.getElementById("p2W"), document.getElementById("p2L")),
        allowIntro: document.getElementById('allowIntro').checked,
        bestOf: checkBo(),
        round: roundInp.value,
        tournamentName: tournamentInp.value,
        caster1Name: caster1NInp.value,
        caster1Twitter: caster1TInp.value,
        caster2Name: caster2NInp.value,
        caster2Twitter: caster2TInp.value,
        workshop: workshopCheck.checked
    };

    let data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(mainPath + "/test.json", data);
}