'use strict';

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const ipc = electron.ipcRenderer;

// yes we all like global variables
const textPath = __dirname + '/Texts';
const charPathBase = __dirname + '/Characters';
const charPathWork = __dirname + '/Characters/_Workshop';
const charPathRandom = __dirname + '/Characters/Random';
let charPath;

const colorList = getJson(textPath + "/Color Slots");
let colorL, colorR;

let currentP1WL = "Nada";
let currentP2WL = "Nada";
let currentBestOf = "Bo5";

let gamemode = 1;

let movedSettings = false;

let inPF = false;
let currentFocus = -1;

const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk


//preload  e v e r y t h i n g
const viewport = document.getElementById('viewport');
const overlayDiv = document.getElementById('overlay');
const goBackDiv = document.getElementById('goBack');

const tNameInps = document.getElementsByClassName("teamName");

//we want the correct order, we cant use getClassName here
function pushArrayInOrder(array, string1, string2 = "") {
    for (let i = 0; i < maxPlayers; i++) {
        array.push(document.getElementById(string1+(i+1)+string2));
    }
}
const pNameInps = [], pTagInps = [], pFinders = [], charLists = [], skinLists = [];
pushArrayInOrder(pNameInps, "p", "Name");
pushArrayInOrder(pTagInps, "p", "Tag");
pushArrayInOrder(pFinders, "pFinder");
pushArrayInOrder(charLists, "p", "Char");
pushArrayInOrder(skinLists, "p", "Skin");

const charImgs = document.getElementsByClassName("charImg");

const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');
const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const checks = document.getElementsByClassName("scoreCheck");

const wlButtons = document.getElementsByClassName("wlButtons");
const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const bo3Div = document.getElementById("bo3Div");
const bo5Div = document.getElementById("bo5Div");

const roundInp = document.getElementById('roundName');
const tournamentInp = document.getElementById('tournamentName');

const casters = document.getElementsByClassName("caster");

const workshopCheck = document.getElementById('workshopToggle');
const noLoAHDCheck = document.getElementById('noLoAHD');
const forceWL = document.getElementById('forceWLToggle');


init();
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
    document.getElementById('settingsRegion').addEventListener("click", moveViewport);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", goBack);


    /* SETTINGS */

    //set listeners for the settings checkboxes
    document.getElementById("allowIntro").addEventListener("click", saveGUISettings);
    workshopCheck.addEventListener("click", workshopToggle);
    document.getElementById("forceAlt").addEventListener("click", saveGUISettings);
    document.getElementById('forceHD').addEventListener("click", HDtoggle);
    document.getElementById("noLoAHD").addEventListener("click", saveGUISettings);
    forceWL.addEventListener("click", forceWLtoggle);
    document.getElementById("alwaysOnTop").addEventListener("click", alwaysOnTop);
    document.getElementById("copyMatch").addEventListener("click", copyMatch);
    
    // load GUI settings
    const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));
    if (guiSettings.allowIntro) {document.getElementById("allowIntro").checked = true};
    if (guiSettings.workshop) {workshopCheck.checked = true} else {
        // disable alt arts checkbox
        document.getElementById("forceAlt").disabled = true;
    };
    if (guiSettings.forceAlt) {document.getElementById("forceAlt").checked = true};
    if (guiSettings.forceHD) {document.getElementById("forceHD").checked = true};
    if (guiSettings.noLoAHD) {noLoAHDCheck.checked = true; noLoAHDCheck.disabled = false};
    if (guiSettings.forceWL) {forceWL.click()};
    if (guiSettings.alwaysOnTop) {document.getElementById("alwaysOnTop").click()};


    /* Overlay */

    //load color slot list and add the color background on each side
    loadColors();


    // we need to set the current char path
    workshopCheck.checked ? charPath = charPathWork : charPath = charPathBase;

    //load the character list for all players on startup
    loadCharacters();

    //set listeners that will trigger when character or skin changes
    for (let i = 0; i < maxPlayers; i++) {
        charLists[i].addEventListener("change", charChangeL);
        skinLists[i].addEventListener("change", skinChangeL);
    }
    //check whenever an image isnt found so we replace it with a "?"
    for (let i = 0; i < charImgs.length; i++) {
        charImgs[i].addEventListener("error", () => {
            charImgs[i].setAttribute('src', charPathRandom + '/P2.png');
        });
    }
    

    //score tick listeners, to automatically check/uncheck the other ticks
    p1Win1.addEventListener("click", changeScoreTicks1);
    p2Win1.addEventListener("click", changeScoreTicks1);
    p1Win2.addEventListener("click", changeScoreTicks2);
    p2Win2.addEventListener("click", changeScoreTicks2);
    p1Win3.addEventListener("click", changeScoreTicks3);
    p2Win3.addEventListener("click", changeScoreTicks3);

    //set click listeners for the [W] and [L] buttons
    p1W.addEventListener("click", setWLP1);
    p1L.addEventListener("click", setWLP1);
    p2W.addEventListener("click", setWLP2);
    p2L.addEventListener("click", setWLP2);


    //for each player input field
    for (let i = 0; i < maxPlayers; i++) {

        //prepare the player finder (player presets)
        preparePF(i+1);

        //check if theres a player preset every time we type or click in the player box
        pNameInps[i].addEventListener("input", checkPlayerPreset);
        pNameInps[i].addEventListener("focusin", checkPlayerPreset);

        //resize the container if it overflows
        pNameInps[i].addEventListener("input", resizeInput);
        //also do it for tag inputs while we're at it
        pTagInps[i].addEventListener("input", resizeInput);
    }
    

    //set click listeners to change the "best of" status
    bo3Div.addEventListener("click", changeBestOf);
    bo5Div.addEventListener("click", changeBestOf);
    //set initial value
    bo3Div.style.color = "var(--text2)";
    bo5Div.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";


    //check if the round is grand finals
    roundInp.addEventListener("input", checkRound);


    //gamemode button
    document.getElementById("gamemode").addEventListener("click", changeGamemode);


    //add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    //add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {

        if (isPresetOpen()) {
            //if a player presets menu is open, load preset
            for (let i = 0; i < pFinders.length; i++) {
                if (pFinders[i].style.display == "block" && currentFocus > -1) {
                    pFinders[i].getElementsByClassName("finderEntry")[currentFocus].click();
                }
            }
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
        if (movedSettings) { //if settings are open, close them
            goBack();
        } else if (isPresetOpen()) { //if a player preset is open, close it
            for (let i = 0; i < pFinders.length; i++) {
                pFinders[i].style.display = "none";
            }
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => { giveWinP1() });
    Mousetrap.bind('f2', () => { giveWinP2() });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        for (let i = 0; i < pFinders.length; i++) {
            if (pFinders[i].style.display == "block") {
                currentFocus++;
                addActive(pFinders[i].getElementsByClassName("finderEntry"));
            }
        }
    });
    Mousetrap.bind('up', () => {
        for (let i = 0; i < pFinders.length; i++) {
            if (pFinders[i].style.display == "block") {
                currentFocus--;
                addActive(pFinders[i].getElementsByClassName("finderEntry"));
            }
        }
    });
}

function isPresetOpen() {
    let theBool = false;
    for (let i = 0; i < pFinders.length; i++) {
        if (pFinders[i].style.display == "block") {
            theBool = true;
        }   
    }
    return theBool;
}

function moveViewport() {
    if (!movedSettings) {
        viewport.style.transform = "translateX(calc(-140% / 3))";
        overlayDiv.style.opacity = ".25";
        goBackDiv.style.display = "block"
        movedSettings = true;
    }
}

function goBack() {
    viewport.style.transform = "translateX(calc(-100% / 3))";
    overlayDiv.style.opacity = "1";
    goBackDiv.style.display = "none";
    movedSettings = false;
}


//called whenever we need to read a json file
function getJson(jPath) {
    try {
        return JSON.parse(fs.readFileSync(jPath + ".json"));
    } catch (error) {
        return null;
    }
}


//calls the main settings file and fills a combo list
function loadCharacters() {

    // create a list with folder names on charPath
    const characterList = fs.readdirSync(charPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter((name) => {
            // if the folder name contains '_Workshop' or 'Random', exclude it
            if (name != "_Workshop" && name != "Random") {
                return true;
            }
        }
    )

    //for each player
    for (let i=0; i < maxPlayers; i++) {

        //use the character list to add entries
        addEntries(charLists[i], characterList);

        //add random to the end of the list
        const option = document.createElement('option');
        option.text = "Random";
        charLists[i].add(option);

        //leave it selected
        charLists[i].selectedIndex = charLists[i].length - 1;

        //update the image to random, only for the first 2 players
        for (let i = 0; i < 2; i++) {
            charImgChange(charImgs[i], "Random");       
        }

        //change the width to the current text
        changeListWidth(charLists[i]);
    }

}


//called whenever we want to change the character
function charChange(list) {

    const currentChar = list.selectedOptions[0].text; //character that has been selected

    //we need to know from what player is this coming from somehow
    const pNum = list.id.substring(1, 2); //yes this is hella dirty
    const skinList = skinLists[pNum-1];

    //load a new skin list
    loadSkins(skinList, currentChar);

    //change the character image of the interface (only for first 2 players)
    if (pNum < 3) {
        //check if skinlist exists first so we dont bug the code later 
        let currentSkin;
        if (skinList.selectedOptions[0]) {
            currentSkin = skinList.selectedOptions[0].text;
        }
        charImgChange(charImgs[pNum-1], currentChar, currentSkin);
    }
    
    //hide the skin dropdown if the list has 1 or less entries
    if (gamemode == 1 && (pNum == 3 || pNum == 4)) {
        //dont do this for players 3 and 4 if the gamemode is singles
    } else {
        if (skinList.options.length <= 1) {
            skinList.style.display = "none";
        } else {
            skinList.style.display = "inline";
        }
    }
    

    //check if the current player name has a custom skin for the character
    checkCustomSkin(pNum);

    //change the width of the box depending on the current text
    changeListWidth(list);

    //do the same for the skin
    changeListWidth(skinList);

}
//same but for listeners
function charChangeL() {
    charChange(this)
}

//for when skin changes, same logic as above
function skinChange(list) {

    //which player is it?
    const pNum = list.id.substring(1, 2);

    //which character is it?
    const currentChar = charLists[pNum-1].selectedOptions[0].text;

    //which skin is it?
    let currentSkin;
    try { //this is necessary when reading from random, wich has no skins
        currentSkin = list.selectedOptions[0].text;
    } catch (error) {
        currentSkin = null;
    }

    //change the image with the current skin (if player 1 or 2)
    if (pNum < 3) {
        charImgChange(charImgs[pNum-1], currentChar, currentSkin);
    }

    //change the width of the combo box depending on the text
    changeListWidth(list);

}
//for listeners
function skinChangeL() {
    skinChange(this);
}

//change the image path depending on the character and skin
function charImgChange(charImg, charName, skinName) {
    charImg.setAttribute('src', charPath + '/' + charName + '/' + skinName + '.png');
}

//will load the skin list of a given character
function loadSkins(comboList, character) {
    const charInfo = getJson(charPath + "/" + character + "/_Info");

    clearList(comboList); //clear the past character's skin list
    if (charInfo) { //if character doesnt have a list (for example: Random), skip this
        addEntries(comboList, charInfo.skinList); //will add everything on the skin list
    }
}

//will add entries to a combo box with a given array
function addEntries(comboList, list) {
    for (let i = 0; i < list.length; i++) {
        const option = document.createElement('option'); //create new entry
        option.text = list[i]; //set the text of entry
        option.className = "theEntry";
        comboList.add(option); //add the entry to the combo list
    }
}

//deletes all entries of a given combo list
function clearList(comboList) {
    for(let i = comboList.length; i >= 0; i--) {
        comboList.remove(i);
    }
}

//used to change the width of a combo box depending on the current text
function changeListWidth(list) {
    try { //this is to fix a bug that happens when trying to read from a hidden list
        list.style.width = getTextWidth(list.selectedOptions[0].text,
            window.getComputedStyle(list).fontSize + " " +
            window.getComputedStyle(list).fontFamily
            ) + 12 + "px";
    } catch (error) {
        //do absolutely nothing
    }
}


//will load the color list to a color slot combo box
function loadColors() {

    //for each color on the list, add them to the color dropdown
    for (let i = 0; i < colorList.length; i++) {

        //create a new div that will have the color info
        const newDiv = document.createElement('div');
        newDiv.title = "Also known as " + colorList[i].hex;
        newDiv.className = "colorEntry";

        //create the color's name
        const newText = document.createElement('div');
        newText.innerHTML = colorList[i].name;
        
        //create the color's rectangle
        const newRect = document.createElement('div');
        newRect.style.width = "13px";
        newRect.style.height = "13px";
        newRect.style.margin = "5px";
        newRect.style.backgroundColor = colorList[i].hex;

        //add them to the div we created before
        newDiv.appendChild(newRect);
        newDiv.appendChild(newText);

        //now add them to the actual interface
        document.getElementById("dropdownColorL").appendChild(newDiv);

        //copy the div we just created to add it to the right side
        const newDivR = newDiv.cloneNode(true);
        document.getElementById("dropdownColorR").appendChild(newDivR);
        
        //if the divs get clicked, update the colors
        newDiv.addEventListener("click", updateColor);
        newDivR.addEventListener("click", updateColor);
    
    }

    //set the initial colors for the interface (the first color for p1, and the second for p2)
    document.getElementById('dropdownColorL').children[0].click();
    document.getElementById('dropdownColorR').children[1].click();
}

function updateColor() {

    const side = this.parentElement.parentElement.id.substring(0, 1);;
    const clickedColor = this.textContent;

    //search for the color we just clicked
    for (let i = 0; i < colorList.length; i++) {
        if (colorList[i].name == clickedColor) {

            const colorRectangle = document.getElementById(side+"ColorRect");
            const colorGrad = document.getElementById(side+"Side");
            
            //change the variable that will be read when clicking the update button
            if (side == "l") {
                colorL = colorList[i].name;
            } else {
                colorR = colorList[i].name;
            }

            //then change both the color rectangle and the background gradient
            colorRectangle.style.backgroundColor = colorList[i].hex;
            colorGrad.style.backgroundImage = "linear-gradient(to bottom left, "+colorList[i].hex+"50, #00000000, #00000000)";
        }
    }

    //remove focus from the menu so it hides on click
    this.parentElement.parentElement.blur();
}


//whenever clicking on the first score tick
function changeScoreTicks1() {
    const pNum = this == p1Win1 ? 1 : 2;

    //deactivate wins 2 and 3
    document.getElementById('winP'+pNum+'-2').checked = false;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//whenever clicking on the second score tick
function changeScoreTicks2() {
    const pNum = this == p1Win2 ? 1 : 2;

    //deactivate win 3, activate win 1
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//something something the third score tick
function changeScoreTicks3() {
    const pNum = this == p1Win3 ? 1 : 2;

    //activate wins 1 and 2
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-2').checked = true;
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

//gives a victory to player 1 
function giveWinP1() {
    if (p1Win2.checked) {
        p1Win3.checked = true;
    } else if (p1Win1.checked) {
        p1Win2.checked = true;
    } else if (!p1Win1.checked) {
        p1Win1.checked = true;
    }
}
//same with P2
function giveWinP2() {
    if (p2Win2.checked) {
        p2Win3.checked = true;
    } else if (p2Win1.checked) {
        p2Win2.checked = true;
    } else if (!p2Win1.checked) {
        p2Win1.checked = true;
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
    currentP1WL = "Nada";
    currentP2WL = "Nada";

    const pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}


//player presets setup
function preparePF(pNum) {
    const pFinderEL = pFinders[pNum-1];

    //if the mouse is hovering a player preset, let us know
    pFinderEL.addEventListener("mouseenter", () => { inPF = true });
    pFinderEL.addEventListener("mouseleave", () => { inPF = false });

    //hide the player presets menu if text input loses focus
    pNameInps[pNum-1].addEventListener("focusout", () => {
        if (!inPF) { //but not if the mouse is hovering a player preset
            pFinderEL.style.display = "none";
        }
    });
}

//called whenever the user types something in the player name box
function checkPlayerPreset() {

    //remove the "focus" for the player presets list
    currentFocus = -1;

    //player check once again
    const pNum = this.id.substring(1, 2);
    const pFinderEL = pFinders[pNum-1];

    //clear the current list each time we type
    pFinderEL.innerHTML = "";

    //if we typed at least 3 letters
    if (this.value.length >= 3) {

        //check the files in that folder
        const files = fs.readdirSync(textPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())) {

                //un-hides the player presets div
                pFinderEL.style.display = "block";

                //go inside that file to get the player info
                const playerInfo = getJson(textPath + "/Player Info/" + file);
                //for each character that player plays
                playerInfo.characters.forEach(char => {

                    //this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    newDiv.addEventListener("click", playerPreset);
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (playerInfo.tag != "") {
                        spanTag.innerHTML = playerInfo.tag;
                        spanTag.className = "pfTag";
                    }

                    //player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = playerInfo.name;
                    spanName.className = "pfName";

                    //player character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = char.character;
                    spanChar.className = "pfChar";

                    //we will use css variables to store data to read when clicked
                    newDiv.style.setProperty("--tag", playerInfo.tag);
                    newDiv.style.setProperty("--name", playerInfo.name);
                    newDiv.style.setProperty("--char", char.character);
                    newDiv.style.setProperty("--skin", char.skin);

                    //add them to the div we created before
                    newDiv.appendChild(spanTag);
                    newDiv.appendChild(spanName);
                    newDiv.appendChild(spanChar);

                    //now for the character image, this is the mask/mirror div
                    const charImgBox = document.createElement("div");
                    charImgBox.className = "pfCharImgBox";

                    //actual image
                    const charImg = document.createElement('img');
                    charImg.className = "pfCharImg";
                    charImg.setAttribute('src', charPath+'/'+char.character+'/'+char.skin+'.png');
                    //we have to position it
                    positionChar(char.character, char.skin, charImg);
                    //and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    //and now add the div to the actual interface
                    pFinderEL.appendChild(newDiv);
                });
            }
        });
    }
}

//now the complicated "change character image" function!
async function positionChar(character, skin, charEL) {

    //get the character positions
    const charInfo = getJson(charPath + "/" + character + "/_Info");
	
	//               x, y, scale
	const charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo) {
		if (charInfo.gui[skin]) { //if the skin has a specific position
			charPos[0] = charInfo.gui[skin].x;
			charPos[1] = charInfo.gui[skin].y;
			charPos[2] = charInfo.gui[skin].scale;
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.gui.neutral.x;
			charPos[1] = charInfo.gui.neutral.y;
			charPos[2] = charInfo.gui.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		charPos[0] = 0;
        charPos[1] = 0;
        charPos[2] = 1.2;
	}
    
    //to position the character
    charEL.style.left = charPos[0] + "px";
    charEL.style.top = charPos[1] + "px";
    charEL.style.transform = "scale(" + charPos[2] + ")";
    
    //if the image fails to load, we will put a placeholder
	charEL.addEventListener("error", () => {
        charEL.setAttribute('src', charPathRandom + '/P2.png');
        charEL.style.left = "0px";
        charEL.style.top = "-2px";
        charEL.style.transform = "scale(1.2)";
	});
}

//called when the user clicks on a player preset
function playerPreset() {

    //we all know what this is by now
    const pNum = this.parentElement.id.substring(this.parentElement.id.length - 1) - 1;

    pTagInps[pNum].value = this.style.getPropertyValue("--tag");
    changeInputWidth(pTagInps[pNum]);

    pNameInps[pNum].value = this.style.getPropertyValue("--name");
    changeInputWidth(pNameInps[pNum]);

    changeListValue(charLists[pNum], this.style.getPropertyValue("--char"));
    charChange(charLists[pNum]);

    changeListValue(skinLists[pNum], this.style.getPropertyValue("--skin"));
    skinChange(skinLists[pNum]);

    checkCustomSkin(pNum+1);

    pFinders[pNum].style.display = "none";
}


//visual feedback to navigate the player presets menu
function addActive(x) {
    //clears active from all entries
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
    }

    //if end of list, cicle
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    //add to the selected entry the active class
    x[currentFocus].classList.add("finderEntry-active");
}


function checkCustomSkin(pNum) {

    pNum -= 1

    //get the player preset list for the current text
    const playerList = getJson(textPath + "/Player Info/" + pNameInps[pNum].value);
    
    if (playerList) { //safety check

        playerList.characters.forEach(char => { //for each possible character

            //if the current character is on the list
            if (char.character == charLists[pNum].selectedOptions[0].text) {

                //first, check if theres a custom skin already
                if (skinLists[pNum].selectedOptions[0].className == "playerCustom") {
                    skinLists[pNum].remove(skinLists[pNum].selectedIndex);
                }

                const option = document.createElement('option'); //create new entry
                option.className = "playerCustom"; //set class so the background changes
                option.text = char.skin; //set the text of entry
                skinLists[pNum].add(option, 0); //add the entry to the beginning of the list
                skinLists[pNum].selectedIndex = 0; //leave it selected
                skinChange(skinLists[pNum]); //update the image
            }

        });

    }
}


//changes the width of an input box depending on the text
function changeInputWidth(input) {
    input.style.width = getTextWidth(input.value,
        window.getComputedStyle(input).fontSize + " " +
        window.getComputedStyle(input).fontFamily
        ) + 12 + "px";
}
//same code as above but just for listeners
function resizeInput() {
    changeInputWidth(this);
}


//used to get the exact width of a text considering the font used
function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}


//used when clicking on the "Best of" buttons
function changeBestOf() {
    let theOtherBestOf; //we always gotta know
    if (this == bo5Div) {
        currentBestOf = "Bo5";
        theOtherBestOf = bo3Div;
        p1Win3.style.display = "block";
        p2Win3.style.display = "block";
    } else {
        currentBestOf = "Bo3";
        theOtherBestOf = bo5Div;
        p1Win3.style.display = "none";
        p2Win3.style.display = "none";
    }

    //change the color and background of the buttons
    this.style.color = "var(--text1)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    theOtherBestOf.style.color = "var(--text2)";
    theOtherBestOf.style.backgroundImage = "var(--bg4)";
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

    //things are about to get messy
    if (gamemode == 1) {
        
        gamemode = 2;

        //show singles icon
        gmIcon2.style.opacity = 0;
        gmIcon1.style.left = "11px"; 
        
        //hide the background character image to reduce clutter
        charImgs[0].style.opacity = 0;
        charImgs[1].style.opacity = 0;

        //add some margin to the color buttons, change border radius
        const lColor = document.getElementById("lColor");
        lColor.style.marginLeft = "5px";
        lColor.style.borderTopLeftRadius = "3px";
        lColor.style.borderBottomLeftRadius = "3px";
        const rColor = document.getElementById("rColor");
        rColor.style.marginLeft = "5px";
        rColor.style.borderTopLeftRadius = "3px";
        rColor.style.borderBottomLeftRadius = "3px";

        for (let i = 1; i < 3; i++) {
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            tNameInps[i-1].style.display = "block";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", tNameInps[i-1]);

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('pInfo'+i));

            charLists[i+1].style.display = "block";
            if (skinLists[i+1].options.length <= 1) {
                skinLists[i+1].style.display = "none";
            } else {
                skinLists[i+1].style.display = "block";
            }

            document.getElementById('pInfo'+(i+2)).style.display = "block";
        }

        //add some left margin to the name/tag inputs, add border radius, change max width
        for (let i = 0; i < maxPlayers; i++) {
            pTagInps[i].style.marginLeft = "5px";

            pNameInps[i].style.borderTopRightRadius = "3px";
            pNameInps[i].style.borderBottomRightRadius = "3px";

            pTagInps[i].style.maxWidth = "45px"
            pNameInps[i].style.maxWidth = "94px"
            
            charLists[i].style.maxWidth = "65px";
            skinLists[i].style.maxWidth = "65px";
        }


        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to Singles");

        //dropdown menus for the right side will now be positioned to the right
        for (let i = 1; i < 5; i+=2) {
            pFinders[i].style.right = "0px";
            pFinders[i].style.left = "";
        }
        document.getElementById("dropdownColorR").style.right = "0px";
        document.getElementById("dropdownColorR").style.left = "";

    } else if (gamemode == 2) {

        gamemode = 1;

        //show doubles icon
        gmIcon2.style.opacity = 1;
        gmIcon1.style.left = "4px";
        gmIcon2.style.left = "17px";

        //remove color button margin, change border radius
        const lColor = document.getElementById("lColor");
        lColor.style.marginLeft = "0px";
        lColor.style.borderTopLeftRadius = "0px";
        lColor.style.borderBottomLeftRadius = "0px";
        const rColor = document.getElementById("rColor");
        rColor.style.marginLeft = "0px";
        rColor.style.borderTopLeftRadius = "0px";
        rColor.style.borderBottomLeftRadius = "0px";        

        //move everything back to normal
        for (let i = 1; i < 3; i++) {
            charImgs[i-1].style.opacity = 1;

            tNameInps[i-1].style.display = "none";
            charLists[i+1].style.display = "none";
            skinLists[i+1].style.display = "none";

            document.getElementById('pInfo'+(i+2)).style.display = "none";

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            document.getElementById("scoreText"+i).style.display = "block";
        
            document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", document.getElementById('pInfo'+i));
        
        }

        for (let i = 0; i < maxPlayers; i++) {
            pTagInps[i].style.marginLeft = "0px";

            pNameInps[i].style.borderTopRightRadius = "0px";
            pNameInps[i].style.borderBottomRightRadius = "0px";

            pTagInps[i].style.maxWidth = "70px"
            pNameInps[i].style.maxWidth = "173px"
            
            charLists[i].style.maxWidth = "141px";
            skinLists[i].style.maxWidth = "141px";
        }

        this.setAttribute('title', "Change the gamemode to Doubles");

        //dropdown menus for the right side will now be positioned to the left
        for (let i = 1; i < 5; i+=2) {
            pFinders[i].style.left = "0px";
            pFinders[i].style.right = "";
        }
    }
}


function swap() {

    //team name
    const teamStore = tNameInps[0].value;
    tNameInps[0].value = tNameInps[1].value;
    tNameInps[1].value = teamStore;

    for (let i = 0; i < maxPlayers; i+=2) {

        //names
        const nameStore = pNameInps[i].value;
        pNameInps[i].value = pNameInps[i+1].value;
        pNameInps[i+1].value = nameStore;
        changeInputWidth(pNameInps[i]);
        changeInputWidth(pNameInps[i+1]);

        //tags
        const tagStore = pTagInps[i].value;
        pTagInps[i].value = pTagInps[i+1].value;
        pTagInps[i+1].value = tagStore;
        changeInputWidth(pTagInps[i]);
        changeInputWidth(pTagInps[i+1]);


        //characters and skins
        const tempP1Char = charLists[i].selectedOptions[0].text;
        const tempP2Char = charLists[i+1].selectedOptions[0].text;
        
        //we need to perform this check since the program would halt when reading from null
        let p1RealSkin, p2RealSkin;
        try {
            p1RealSkin = skinLists[i].selectedOptions[0].text
        } catch (error) {
            p1RealSkin = "";
        }
        try {
            p2RealSkin = skinLists[i+1].selectedOptions[0].text
        } catch (error) {
            p2RealSkin = "";
        }

        const tempP1Skin = p1RealSkin;
        const tempP2Skin = p2RealSkin;

        changeListValue(charLists[i], tempP2Char);
        changeListValue(charLists[i+1], tempP1Char);
        //the change event doesnt fire up on its own so we have to change the image ourselves
        charChange(charLists[i]);
        charChange(charLists[i+1]);

        //same but for skins
        changeListValue(skinLists[i], tempP2Skin);
        changeListValue(skinLists[i+1], tempP1Skin);
        skinChange(skinLists[i]);
        skinChange(skinLists[i+1]);

        //find out if the swapped skin is a custom one
        checkCustomSkin(i+1);
        checkCustomSkin(i+2);
    }    

    //scores
    const tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    const tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);

    //W/K, only if they are visible
    if (p1W.style.display = "flex") {
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
}

function clearPlayers() {

    //crear the team names
    for (let i = 0; i < tNameInps.length; i++) {
        tNameInps[i].value = "";        
    }

    for (let i = 0; i < maxPlayers; i++) {

        //clear player texts and tags
        pNameInps[i].value = "";
        changeInputWidth(pNameInps[i]);
        pTagInps[i].value = "";
        changeInputWidth(pTagInps[i]);

        //reset characters to random
        clearList(charLists[i]);

    }

    //reset the character lists
    loadCharacters();

    //dont forget to clear the skin list!
    for (let i = 0; i < maxPlayers; i++) {
        clearList(skinLists[i]);
        skinLists[i].style.display = "none";
    }

    //clear player scores
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
    }
}

//to force the list to use a specific entry
function changeListValue(list, name) {
    for (let i = 0; i < list.length; i++) {
        if (list.options[i].text == name) {
            list.selectedIndex = i;
        }
    }
}

//manually sets the player's score
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
function workshopToggle() {

    // set a new character path
    charPath = this.checked ? charPathWork : charPathBase;
    
    //clear current character lists
    for (let i = 0; i < maxPlayers; i++) {
        clearList(charLists[i])        
    }
    //then reload character lists
    loadCharacters();
    //dont forget to clear the skin lists
    for (let i = 0; i < maxPlayers; i++) {
        clearList(skinLists[i])
        skinLists[i].style.display = "none";
    }

    // disable or enable alt arts checkbox
    if (this.checked) {
        document.getElementById("forceAlt").disabled = false;
    } else {
        document.getElementById("forceAlt").disabled = true;
    }

    // save current checkbox value to the settings file
    saveGUISettings();

}

// whenever the user clicks on the force W/L checkbox
function forceWLtoggle() {

    // forces the W/L buttons to appear, or unforces them
    if (forceWL.checked) {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "flex";
        }
    } else {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "none";
            deactivateWL();
        }
    }

    // save current checkbox value to the settings file
    saveGUISettings();

}

// whenever the user clicks on the HD renders checkbox
function HDtoggle() {

    // enables or disables the second forceHD option
    if (this.checked) {
        noLoAHDCheck.disabled = false;
    } else {
        noLoAHDCheck.disabled = true;
    }

    // save current checkbox value to the settings file
    saveGUISettings();

}

// sends the signal to electron to activate always on top
function alwaysOnTop() {
    ipc.send('alwaysOnTop', this.checked);
    saveGUISettings();
}

//will copy the current match info to the clipboard
// Format: "Tournament Name - Round - Player1 (Character1) VS Player2 (Character2)"
function copyMatch() {

    //initialize the string
    let copiedText = tournamentInp.value + " - " + roundInp.value + " - ";

    if (gamemode == 1) { //for singles matches
        //check if the player has a tag to add
        if (pTagInps[0].value) {
            copiedText += pTagInps[0].value + " | ";
        }
        copiedText += pNameInps[0].value + " (" + charLists[0].selectedOptions[0].text +") VS ";
        if (pTagInps[1].value) {
            copiedText += pTagInps[1].value + " | ";
        }
        copiedText += pNameInps[1].value + " (" + charLists[1].selectedOptions[0].text +")";
    } else { //for team matches
        copiedText += tNameInps[0].value + " VS " + tNameInps[1].value;
    }

    //send the string to the user's clipboard
    navigator.clipboard.writeText(copiedText);
}

// called whenever the used clicks on a settings checkbox
function saveGUISettings() {
    
    // read the file
    const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));

    // update the settings to current values
    guiSettings.allowIntro = document.getElementById("allowIntro").checked;
    guiSettings.workshop = workshopCheck.checked;
    guiSettings.forceAlt = document.getElementById("forceAlt").checked;
    guiSettings.forceHD = document.getElementById("forceHD").checked;
    guiSettings.noLoAHD = noLoAHDCheck.checked;
    guiSettings.forceWL = forceWL.checked;
    guiSettings.alwaysOnTop = document.getElementById("alwaysOnTop").checked;

    // save the file
    fs.writeFileSync(textPath + "/GUI Settings.json", JSON.stringify(guiSettings, null, 2));

}


//time to write it down
function writeScoreboard() {

    //this is what's going to be in the json file
    const scoreboardJson = {
        player: [], //more lines will be added below
        teamName: [
            tNameInps[0].value,
            tNameInps[1].value
        ],
        color: [
            colorL,
            colorR
        ],
        score: [
            checkScore(p1Win1, p1Win2, p1Win3),
            checkScore(p2Win1, p2Win2, p2Win3)
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
        workshop: workshopCheck.checked,
        forceHD: document.getElementById('forceHD').checked,
        noLoAHD: noLoAHDCheck.checked,
        forceAlt: document.getElementById('forceAlt').checked
    };
    //add the player's info to the player section of the json
    for (let i = 0; i < maxPlayers; i++) {

        //we need to perform this check since the program would halt when reading from null
        let realSkin;
        try {
            realSkin = skinLists[i].selectedOptions[0].text
        } catch (error) {
            realSkin = "";
        }

        scoreboardJson.player.push({
            name: pNameInps[i].value,
            tag: pTagInps[i].value,
            character: charLists[i].selectedOptions[0].text,
            skin: realSkin,
        })
    }
    //do the same for the casters
    for (let i = 0; i < casters.length; i++) {
        scoreboardJson.caster.push({
            name: document.getElementById('cName'+(i+1)).value,
            twitter: document.getElementById('cTwitter'+(i+1)).value,
            twitch: document.getElementById('cTwitch'+(i+1)).value,
        })
    }

    //now convert it to a text we can save intro a file
    const data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(textPath + "/ScoreboardInfo.json", data);


    //simple .txt files
    for (let i = 0; i < maxPlayers; i++) {
        fs.writeFileSync(textPath + "/Simple Texts/Player "+(i+1)+".txt", pNameInps[i].value);        
    }

    fs.writeFileSync(textPath + "/Simple Texts/Team 1.txt", tNameInps[0].value);
    fs.writeFileSync(textPath + "/Simple Texts/Team 2.txt", tNameInps[1].value);

    fs.writeFileSync(textPath + "/Simple Texts/Score L.txt", checkScore(p1Win1, p1Win2, p1Win3).toString());
    fs.writeFileSync(textPath + "/Simple Texts/Score R.txt", checkScore(p2Win1, p2Win2, p2Win3).toString());

    fs.writeFileSync(textPath + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(textPath + "/Simple Texts/Tournament Name.txt", tournamentInp.value);

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Name.txt", document.getElementById('cName'+(i+1)).value);
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Twitter.txt", document.getElementById('cTwitter'+(i+1)).value);
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Twitch.txt", document.getElementById('cTwitch'+(i+1)).value);    
    }

}