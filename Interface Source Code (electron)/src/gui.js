window.onload = init;

const fs = require('fs');
const path = require('path');
const { isUndefined } = require('util');

const mainPath = path.join(__dirname, '..', '..', 'Stream Controller', 'Resources', 'Texts');
const charPath = path.join(__dirname, '..', '..', 'Stream Controller', 'Resources', 'Characters');

//yes we all like global variables
let colorP1, colorP2;

const viewport = document.getElementById('viewport');

const p1NameInp = document.getElementById('p1Name');
const p1TagInp = document.getElementById('p1Tag');
const p2NameInp = document.getElementById('p2Name');
const p2TagInp = document.getElementById('p2Tag');

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

let movedSettings = false;

function init() {
    console.log(mainPath)

    //first, add listeners for the bottom bar
    updateEL.addEventListener("click", writeScoreboard); //write json
    document.getElementById('settingsRegion').addEventListener("click", moveViewport);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", goBack);

    //move the viewport to the center (this is to avoid animation bugs)
    viewport.style.right = "100%";

    
    /* OVERLAY */

    //load the character list on startup
    loadCharacters(p1CharList, 1);
    loadCharacters(p2CharList, 2);

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
    loadColors(1);
    loadColors(2);

    //check whenever the player's name has a skin
    p1NameInp.addEventListener("input", checkPlayerSkin);
    p2NameInp.addEventListener("input", checkPlayerSkin);

    //check if the round is grand finals
    roundInp.addEventListener("input", checkRound);

    //add a listener to the swap button
    document.getElementById('playerSep').addEventListener("click", swap);


    /* SETTINGS */

    //set a listener for the workshop check
    workshopCheck.addEventListener("click", workshopChange);


    //for keyboard shortcuts
    document.onkeypress = function (key) { keyShortcuts(key) };
}


function moveViewport() {
    if (!movedSettings) {
        viewport.style.right = "140%";
        document.getElementById('overlay').style.opacity = "25%";
        document.getElementById('goBack').style.display = "block"
        movedSettings = true;
    }
}

function goBack() {
    viewport.style.right = "100%";
    document.getElementById('overlay').style.opacity = "100%";
    document.getElementById('goBack').style.display = "none";
    movedSettings = false;
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
function loadCharacters(comboList, nPlayer) {
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
    charImgChange(document.getElementById('p' + nPlayer + 'CharImg'), "Random", undefined);
}


//called whenever the user changes character
function charChange() {
    const currentChar = this.selectedOptions[0].text; //current selection

    let pNum; //just a simple 'which player are we' test
    if (this == p1CharList) {
        pNum = 1;
    } else {
        pNum = 2;
    }

    //load a new skin list
    loadSkins(document.getElementById('p'+pNum+'Skin'), currentChar);

    let currentSkin;
    try { //check if skinlist exists first so we dont bug the code later
        currentSkin = document.getElementById('p'+pNum+'Skin').selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    //change the character image of the interface
    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);
}
//same but with parameters
function charChangeManual(list, pNum) {
    const currentChar = list.selectedOptions[0].text; //current selection

    //load a new skin list
    loadSkins(document.getElementById('p'+pNum+'Skin'), currentChar);

    let currentSkin;
    try { //check if skinlist exists first so we dont bug the code later
        currentSkin = document.getElementById('p'+pNum+'Skin').selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    //change the character image of the interface
    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);
}


function skinChange() {

    let pNum;
    if (this == p1SkinList) {
        pNum = 1;
    } else {
        pNum = 2;
    }

    let currentChar = document.getElementById('p'+pNum+'Char').selectedOptions[0].text;

    let currentSkin;
    try {
        currentSkin = this.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);
}
//same but with parameters
function skinChangeManual(list, pNum) {
    let currentChar = document.getElementById('p'+pNum+'Char').selectedOptions[0].text;

    let currentSkin;
    try {
        currentSkin = list.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);
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
function loadColors(pNum) {
    let colorList = getJson("InterfaceInfo"); //check the color list

    //for each color found, add them to the color list
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {

        //create a new div that will have the color info
        let newDiv = document.createElement('div');
        newDiv.style.display = "flex"; //so everything is in 1 line
        newDiv.title = "Also known as " + colorList.colorSlots["color"+i].hex;
        newDiv.className = "colorEntry";

        //if the div gets clicked, update the colors
        newDiv.addEventListener("click", updateColor);

        //create the color's name
        let newText = document.createElement('div');
        newText.innerHTML = colorList.colorSlots["color"+i].name;
        
        //create the color's rectangle
        let newRect = document.createElement('div');
        newRect.style.width = "13px";
        newRect.style.height = "13px";
        newRect.style.margin = "5px";
        newRect.style.backgroundColor = colorList.colorSlots["color"+i].hex;

        //add them to the div we created before
        newDiv.appendChild(newRect);
        newDiv.appendChild(newText);

        //now add them to the actual interface
        document.getElementById("dropdownColorP"+pNum).appendChild(newDiv);
    }

    //set the initial colors for the interface (the first color for p1, and the second for p2)
    if (pNum == 1) {
        document.getElementById("player1").style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+0].hex+"50, #00000000, #00000000)";
        document.getElementById("p1ColorRect").style.backgroundColor = colorList.colorSlots["color"+0].hex;
    } else {
        document.getElementById("player2").style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+1].hex+"50, #00000000, #00000000)";
        document.getElementById("p2ColorRect").style.backgroundColor = colorList.colorSlots["color"+1].hex;
    }

    //finally, set initial values for the global color variables
    colorP1 = "Red";
    colorP2 = "Blue";
}

function updateColor() {
    let pNum;
    if (this.parentElement.parentElement == document.getElementById("p1Color")) {
        pNum = 1;
    } else {
        pNum = 2;
    }

    let clickedColor = this.textContent;
    let colorList = getJson("InterfaceInfo");

    //search for the color we just clicked
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {
        if (colorList.colorSlots["color"+i].name == clickedColor) {
            let colorRectangle, colorGrad;

            colorRectangle = document.getElementById("p"+pNum+"ColorRect");
            colorGrad = document.getElementById("player"+pNum);
            
            //change the variable that will be read when clicking the update button
            if (pNum == 1) {
                colorP1 = colorList.colorSlots["color"+i].name;
            } else {
                colorP2 = colorList.colorSlots["color"+i].name;
            }

            //then change both the color rectangle and the background gradient
            colorRectangle.style.backgroundColor = colorList.colorSlots["color"+i].hex;
            colorGrad.style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+i].hex+"50, #00000000, #00000000)";
        }
    }
    //remove focus from the menu so it hides on click
    this.parentElement.parentElement.blur();
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
        return "W"; //to change
    } else if (los.checked) {
        return "L"; //to change
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

function checkPlayerSkin() {
    let pNum;
    if (this == p1NameInp) {
        pNum = 1;
    } else {
        pNum = 2;
    }
    const skinList = getJson("Character Info/" + document.getElementById('p'+pNum+'Char').selectedOptions[0].text);
    
    if (skinList != undefined) {
        for (let i = 0; i < skinList.playerCustoms.length; i++) {
            //if the player name matchs a custom skin
            if (skinList.playerCustoms[i] == document.getElementById('p'+pNum+'Name').value) {

                //first, check if theres a custom skin already
                if (document.getElementById('p'+pNum+'Skin').selectedOptions[0].className == "playerCustom") {
                    document.getElementById('p'+pNum+'Skin').remove(document.getElementById('p'+pNum+'Skin').selectedIndex);
                }

                let option = document.createElement('option'); //create new entry
                option.className = "playerCustom";
                option.text = skinList.playerCustoms[i]; //set the text of entry
                document.getElementById('p'+pNum+'Skin').add(option, 0); //add the entry to the beginning of the list
                document.getElementById('p'+pNum+'Skin').selectedIndex = 0; //leave it selected
                skinChangeManual(document.getElementById('p'+pNum+'Skin'), pNum); //update the image
            }
        }
    }
}

function checkRound() {
    let radios = document.getElementsByClassName("pWL");
    for (let i = 0; i < radios.length; i++) {
        if (roundInp.value.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase()) {
            radios[i].disabled = false;
        } else {
            radios[i].disabled = true;
        }
    }
}


function swap() {
    let tempP1Name = p1NameInp.value;
    let tempP1Team = p1TagInp.value;
    let tempP2Name = p2NameInp.value;
    let tempP2Team = p2TagInp.value;

    p1NameInp.value = tempP2Name;
    p1TagInp.value = tempP2Team;
    p2NameInp.value = tempP1Name;
    p2TagInp.value = tempP1Team;


    let tempP1Char = p1CharList.selectedOptions[0].text;
    let tempP2Char = p2CharList.selectedOptions[0].text;
    
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

    let tempP1Skin = p1RealSkin;
    let tempP2Skin = p2RealSkin;

    changeListValue(p1CharList, tempP2Char);
    changeListValue(p2CharList, tempP1Char);
    //the change event doesnt fire up on its own so we have to change the image ourselves
    charChangeManual(p1CharList, 1);
    charChangeManual(p2CharList, 2);

    changeListValue(p1SkinList, tempP2Skin);
    changeListValue(p2SkinList, tempP1Skin);
    skinChangeManual(p1SkinList, 1);
    skinChangeManual(p2SkinList, 2);


    tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);
}

function changeListValue(list, name) {
    for (let i = 0; i < list.length; i++) {
        if (list.options[i].text == name) {
            list.selectedIndex = i;
        }
    }
}

function setScore(score, tick1, tick2, tick3) {
    tick1.checked = false;
    tick2.checked = false;
    tick3.checked = false;
    if (score > 0) {
        tick1.checked = true;
        if (score > 1) {
            tick2.checked = true;
            if (score > 2) {
                tick3.checked = true;
            }
        }
    }
}


//called whenever the user clicks on the workshop toggle
function workshopChange() {
    //first clear current character lists
    clearList(p1CharList);
    clearList(p2CharList);
    //then reload both character lists
    loadCharacters(p1CharList, 1);
    loadCharacters(p2CharList, 2);
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
        p1Color: colorP1,
        p1Score: checkScore(p1Win1, p1Win2, p1Win3),
        p1WL: checkWL(document.getElementById("p1W"), document.getElementById("p1L")),
        p2Name: p2NameInp.value,
        p2Team: p2TagInp.value,
        p2Character: p2CharList.selectedOptions[0].text,
        p2Skin: p2RealSkin,
        p2Color: colorP2,
        p2Score: checkScore(p2Win1, p2Win2, p2Win3),
        p2WL: checkWL(document.getElementById("p2W"), document.getElementById("p2L")),
        bestOf: checkBo(),
        round: roundInp.value,
        tournamentName: tournamentInp.value,
        caster1Name: caster1NInp.value,
        caster1Twitter: caster1TInp.value,
        caster2Name: caster2NInp.value,
        caster2Twitter: caster2TInp.value,
        allowIntro: document.getElementById('allowIntro').checked,
        workshop: workshopCheck.checked
    };

    let data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(mainPath + "/ScoreboardInfo.json", data);
}


function keyShortcuts(key) {

    //when pressing "Enter"
    if (key.keyCode == 13) {
        writeScoreboard();
    }

}