const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Texts');
const charPath = path.resolve(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Characters');
//change to these paths when building the executable
/* const mainPath = path.resolve('.', 'Stream Tool', 'Resources', 'Texts');
const charPath = path.resolve('.', 'Stream Tool', 'Resources', 'Characters'); */


//yes we all like global variables
let colorP1, colorP2;
let currentP1WL = "Nada";
let currentP2WL = "Nada";
let currentBestOf = "Bo5";

let movedSettings = false;

let inPF = false;
let currentFocus = -1;


const viewport = document.getElementById('viewport');

const p1NameInp = document.getElementById('p1Name');
const p1TagInp = document.getElementById('p1Tag');
const p2NameInp = document.getElementById('p2Name');
const p2TagInp = document.getElementById('p2Tag');

const p1PF = document.getElementById('pFinder1');
const p2PF = document.getElementById('pFinder2');

const p1CharList = document.getElementById('p1Char');
const p1SkinList = document.getElementById('p1Skin');
const p2CharList = document.getElementById('p2Char');
const p2SkinList = document.getElementById('p2Skin');

const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');
const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const roundInp = document.getElementById('roundName');

const workshopCheck = document.getElementById('workshopToggle');
const forceWL = document.getElementById('forceWLToggle');


window.onload = init;
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
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
    document.getElementById('p1CharImg').addEventListener("error", () => {
        document.getElementById('p1CharImg').setAttribute('src', charPath + '/' + 'Random/P2.png');
    });
    document.getElementById('p2CharImg').addEventListener("error", () => {
        document.getElementById('p2CharImg').setAttribute('src', charPath + '/' + 'Random/P2.png');
    });


    //load color slot list
    loadColors(1);
    loadColors(2);

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


    //prepare the player finder (player presets)
    preparePF(1);
    preparePF(2);
    //check if theres a player preset every time we type in the player box
    p1NameInp.addEventListener("input", checkPlayerPreset);
    p1NameInp.addEventListener("focusin", checkPlayerPreset);
    p2NameInp.addEventListener("input", checkPlayerPreset);
    p2NameInp.addEventListener("focusin", checkPlayerPreset);

    //resize the tag box whenever the user types
    p1TagInp.addEventListener("input", resizeInput);
    p2TagInp.addEventListener("input", resizeInput);


    //set click listeners to change the "best of" status
    document.getElementById("bo3Div").addEventListener("click", changeBestOf);
    document.getElementById("bo5Div").addEventListener("click", changeBestOf);
    //set initial value
    document.getElementById("bo3Div").style.color = "var(--text2)";
    document.getElementById("bo5Div").style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";


    //check if the round is grand finals
    roundInp.addEventListener("input", checkRound);


    //add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    //add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);


    /* SETTINGS */

    //set listeners for the settings checkboxes
    workshopCheck.addEventListener("click", workshopChange);
    forceWL.addEventListener("click", forceWLtoggles);
    document.getElementById('forceHD').addEventListener("click", HDtoggle);


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {
        if (p1PF.style.display == "block" || p2PF.style.display == "block") {
            //if the player presets menu is open, load preset
            if (p1PF.style.display == "block" && currentFocus > -1) {
                p1PF.getElementsByClassName("finderEntry")[currentFocus].click();
            } else if (p2PF.style.display == "block" && currentFocus > -1) {
                p2PF.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else {
            //update scoreboard info (updates botBar color for visual feedback)
            writeScoreboard();
            document.getElementById('botBar').style.backgroundColor = "var(--bg3)";
        }
    }, 'keydown');
    Mousetrap.bind('enter', () => {
        document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
     }, 'keyup');

    //esc to clear player info
    Mousetrap.bind('esc', () => {
        if (movedSettings) { //if settings are open, close them
            goBack();
        } else if (p1PF.style.display == "block") { //if player presets visible
            p1PF.style.display = "none";
        } else if (p2PF.style.display == "block") {
            p2PF.style.display = "none";
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => { giveWinP1() });
    Mousetrap.bind('f2', () => { giveWinP2() });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        if (p1PF.style.display == "block" || p2PF.style.display == "block") {
            currentFocus++;
            if (p1PF.style.display == "block") {
                addActive(p1PF.getElementsByClassName("finderEntry"));
            } else {
                addActive(p2PF.getElementsByClassName("finderEntry"));
            }
        }
    });
    Mousetrap.bind('up', () => {
        if (p1PF.style.display == "block" || p2PF.style.display == "block") {
            currentFocus--;
            if (p1PF.style.display == "block") {
                addActive(p1PF.getElementsByClassName("finderEntry"));
            } else {
                addActive(p2PF.getElementsByClassName("finderEntry"));
            }
        }
    });
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
        const settingsRaw = fs.readFileSync(mainPath + "/" + fileName + ".json");
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
    const option = document.createElement('option');
    option.text = "Random";
    comboList.add(option);

    //leave it selected
    comboList.selectedIndex = comboList.length - 1;

    //update the image (to random)
    charImgChange(document.getElementById('p' + nPlayer + 'CharImg'), "Random", undefined);

    //change the width to the current text
    changeListWidth(comboList);
}

//called whenever the user changes character
function charChange() {
    const currentChar = this.selectedOptions[0].text; //current selection

    //just a simple 'which player are we' test
    const pNum = this == p1CharList ? 1 : 2;

    const skinList = document.getElementById('p'+pNum+'Skin');

    //load a new skin list
    loadSkins(skinList, currentChar);

    let currentSkin;
    try { //check if skinlist exists first so we dont bug the code later
        currentSkin = skinList.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    //change the character image of the interface
    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);

    //hide the skin list if the list has 1 or less entries
    if (skinList.options.length <= 1) {
        skinList.style.display = "none";
    } else {
        skinList.style.display = "inline";
    }

    //check if the current player name has a custom skin for the character
    checkCustomSkin(pNum);

    //change the width of the box depending on the current text
    changeListWidth(this);

    //do the same for the skin
    changeListWidth(skinList);
}
//same but with parameters
function charChangeManual(list, pNum) {
    const currentChar = list.selectedOptions[0].text;

    const skinList = document.getElementById('p'+pNum+'Skin');

    loadSkins(skinList, currentChar);

    let currentSkin;
    try {
        currentSkin = skinList.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);

    if (skinList.options.length <= 1) {
        skinList.style.display = "none";
    } else {
        skinList.style.display = "inline";
    }

    changeListWidth(list);
}

//for when skin changes, same logic as above
function skinChange() {

    //which player is it?
    const pNum = this == p1SkinList ? 1 : 2;

    //which character is it?
    const currentChar = document.getElementById('p'+pNum+'Char').selectedOptions[0].text;

    let currentSkin; //which skin is it?
    try {
        currentSkin = this.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    //change the image with the current skin
    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);

    //change the width of the combo box depending on the text
    changeListWidth(this);
}
//same but with parameters
function skinChangeManual(list, pNum) {
    const currentChar = document.getElementById('p'+pNum+'Char').selectedOptions[0].text;

    let currentSkin;
    try {
        currentSkin = list.selectedOptions[0].text;
    } catch (error) {
        currentSkin = undefined;
    }

    charImgChange(document.getElementById('p'+pNum+'CharImg'), currentChar, currentSkin);

    changeListWidth(list);
}

//change the image path depending on the character and skin
function charImgChange(charImg, charName, skinName) {
    charImg.setAttribute('src', charPath + '/' + charName + '/' + skinName + '.png');
}

//will load the skin list of a given character
function loadSkins(comboList, character) {
    const charInfo = getJson("Character Info/" + character);

    clearList(comboList); //clear the past character's skin list
    if (charInfo != undefined) { //if character doesnt have a list (for example: Random), skip this
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
function loadColors(pNum) {
    const colorList = getJson("InterfaceInfo"); //check the color list

    //for each color found, add them to the color list
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {

        //create a new div that will have the color info
        const newDiv = document.createElement('div');
        newDiv.title = "Also known as " + colorList.colorSlots["color"+i].hex;
        newDiv.className = "colorEntry";

        //if the div gets clicked, update the colors
        newDiv.addEventListener("click", updateColor);

        //create the color's name
        const newText = document.createElement('div');
        newText.innerHTML = colorList.colorSlots["color"+i].name;
        
        //create the color's rectangle
        const newRect = document.createElement('div');
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

    //you've seen this one enough already, right?
    const pNum = this.parentElement.parentElement == document.getElementById("p1Color") ? 1 : 2;

    const clickedColor = this.textContent;
    const colorList = getJson("InterfaceInfo");

    //search for the color we just clicked
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {
        if (colorList.colorSlots["color"+i].name == clickedColor) {

            const colorRectangle = document.getElementById("p"+pNum+"ColorRect");
            const colorGrad = document.getElementById("player"+pNum);
            
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
    document.getElementById;

    pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}


//player presets setup
function preparePF(pNum) {
    const pFinderEL = document.getElementById("pFinder"+pNum);

    //if the mouse is hovering a player preset, let us know
    pFinderEL.addEventListener("mouseenter", () => { inPF = true });
    pFinderEL.addEventListener("mouseleave", () => { inPF = false });

    //hide the player presets menu if text input loses focus
    document.getElementById('p'+pNum+'Name').addEventListener("focusout", () => {
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
    const pNum = this == p1NameInp ? 1 : 2;
    const pFinderEL = document.getElementById("pFinder"+pNum);

    //clear the current list each time we type
    pFinderEL.innerHTML = "";

    //if we typed at least 3 letters
    if (this.value.length >= 3) {

        //check the files in that folder
        const files = fs.readdirSync(mainPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())) {

                //un-hides the player presets div
                pFinderEL.style.display = "block";

                //go inside that file to get the player info
                const playerInfo = getJson("Player Info/" + file);
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

    //take the chance to resize the box
    changeInputWidth(this);
}

//now the complicated "change character image" function!
async function positionChar(character, skin, charEL) {

    //get the character positions
    const charInfo = getJson("Character Info/" + character);
	
	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo != undefined) {
		if (charInfo.gui[skin]) { //if the skin has a specific position
			charPos[0] = charInfo.gui[skin].x;
			charPos[1] = charInfo.gui[skin].y;
			charPos[2] = charInfo.gui[skin].scale;
		} else if (skin.startsWith("Alt ")) { //for a group of imgs that have a specific position
			charPos[0] = charInfo.gui.alt.x;
			charPos[1] = charInfo.gui.alt.y;
			charPos[2] = charInfo.gui.alt.scale;
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
        charEL.setAttribute('src', charPath + '/Random/P2.png');
        charEL.style.left = "0px";
        charEL.style.top = "-2px";
        charEL.style.transform = "scale(1.2)";
	});
}

//called when the user clicks on a player preset
function playerPreset() {

    //we all know what this is by now
    const pNum = this.parentElement == p1PF ? 1 : 2;

    const pTagEL = document.getElementById('p'+pNum+'Tag');
    const pNameEL = document.getElementById('p'+pNum+'Name');
    const pCharEL = document.getElementById('p'+pNum+'Char');
    const pSkinEL = document.getElementById('p'+pNum+'Skin');

    pTagEL.value = this.style.getPropertyValue("--tag");
    changeInputWidth(pTagEL); //resizes the text box if it overflows

    pNameEL.value = this.style.getPropertyValue("--name");
    changeInputWidth(pNameEL);

    changeListValue(pCharEL, this.style.getPropertyValue("--char"));
    charChangeManual(pCharEL, pNum);

    changeListValue(pSkinEL, this.style.getPropertyValue("--skin"));
    skinChangeManual(pSkinEL, pNum);

    checkCustomSkin(pNum);

    document.getElementById("pFinder"+pNum).style.display = "none";
}


//visual feedback to navigate the player presets menu
function addActive(x) {
    //clears active from all entries
    for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
    }

    //if end of list, cicle
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    //add to the selected entry the active class
    x[currentFocus].classList.add("finderEntry-active");
}


function checkCustomSkin(pNum) {

    //get the player preset list for the current text
    const playerList = getJson("Player Info/" + document.getElementById('p'+pNum+'Name').value);
    
    if (playerList != undefined) { //safety check

        playerList.characters.forEach(char => { //for each possible character

            //if the current character is on the list
            if (char.character == document.getElementById('p'+pNum+'Char').selectedOptions[0].text) {

                //first, check if theres a custom skin already
                if (document.getElementById('p'+pNum+'Skin').selectedOptions[0].className == "playerCustom") {
                    document.getElementById('p'+pNum+'Skin').remove(document.getElementById('p'+pNum+'Skin').selectedIndex);
                }

                const option = document.createElement('option'); //create new entry
                option.className = "playerCustom"; //set class so the background changes
                option.text = char.skin; //set the text of entry
                document.getElementById('p'+pNum+'Skin').add(option, 0); //add the entry to the beginning of the list
                document.getElementById('p'+pNum+'Skin').selectedIndex = 0; //leave it selected
                skinChangeManual(document.getElementById('p'+pNum+'Skin'), pNum); //update the image
            }

        });

    }
}

//same code as above but just for the player tag
function resizeInput() {
    changeInputWidth(this);
}

//changes the width of an input box depending on the text
function changeInputWidth(input) {
    input.style.width = getTextWidth(input.value,
        window.getComputedStyle(input).fontSize + " " +
        window.getComputedStyle(input).fontFamily
        ) + 12 + "px";
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
    if (this == document.getElementById("bo5Div")) {
        currentBestOf = "Bo5";
        theOtherBestOf = document.getElementById("bo3Div");
        p1Win3.style.display = "block";
        p2Win3.style.display = "block";
    } else {
        currentBestOf = "Bo3";
        theOtherBestOf = document.getElementById("bo5Div");
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
        const wlButtons = document.getElementsByClassName("wlButtons");

        if (roundInp.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "inline";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
    }
}


function swap() {
    const tempP1Name = p1NameInp.value;
    const tempP1Team = p1TagInp.value;
    const tempP2Name = p2NameInp.value;
    const tempP2Team = p2TagInp.value;

    p1NameInp.value = tempP2Name;
    p1TagInp.value = tempP2Team;
    p2NameInp.value = tempP1Name;
    p2TagInp.value = tempP1Team;

    changeInputWidth(p1NameInp);
    changeInputWidth(p1TagInp);
    changeInputWidth(p2NameInp);
    changeInputWidth(p2TagInp);


    const tempP1Char = p1CharList.selectedOptions[0].text;
    const tempP2Char = p2CharList.selectedOptions[0].text;
    
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

    const tempP1Skin = p1RealSkin;
    const tempP2Skin = p2RealSkin;

    changeListValue(p1CharList, tempP2Char);
    changeListValue(p2CharList, tempP1Char);
    //the change event doesnt fire up on its own so we have to change the image ourselves
    charChangeManual(p1CharList, 1);
    charChangeManual(p2CharList, 2);

    changeListValue(p1SkinList, tempP2Skin);
    changeListValue(p2SkinList, tempP1Skin);
    skinChangeManual(p1SkinList, 1);
    skinChangeManual(p2SkinList, 2);

    checkCustomSkin(1);
    checkCustomSkin(2);


    const tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    const tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);
}

function clearPlayers() {
    //clear player texts
    p1TagInp.value = "";
    p1NameInp.value = "";
    p2TagInp.value = "";
    p2NameInp.value = "";
    changeInputWidth(p1TagInp);
    changeInputWidth(p1NameInp);
    changeInputWidth(p2TagInp);
    changeInputWidth(p2NameInp);

    //reset characters to random
    clearList(p1CharList);
    clearList(p2CharList);
    loadCharacters(p1CharList, 1);
    loadCharacters(p2CharList, 2);
    clearList(p1SkinList);
    clearList(p2SkinList);
    p1SkinList.style.display = "none";
    p2SkinList.style.display = "none";

    //clear player scores
    const checks = document.getElementsByClassName("scoreCheck");
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
function workshopChange() {
    //clear current character lists
    clearList(p1CharList);
    clearList(p2CharList);
    //then reload both character lists
    loadCharacters(p1CharList, 1);
    loadCharacters(p2CharList, 2);
    //dont forget to clear the skin lists
    clearList(p1SkinList);
    clearList(p2SkinList);
    //hide the skin lists
    p1SkinList.style.display = "none";
    p2SkinList.style.display = "none";
}

//forces the W/L buttons to appear, or unforces them
function forceWLtoggles() {
    const wlButtons = document.getElementsByClassName("wlButtons");
        if (forceWL.checked) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "inline";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
}

//just enables or disables the second forceHD option
function HDtoggle() {
    if (this.checked) {
        document.getElementById('noLoAHD').disabled = false;
    } else {
        document.getElementById('noLoAHD').disabled = true;
    }
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

    //this is what's going to be in the json file
    const scoreboardJson = {
        p1Name: p1NameInp.value,
        p1Team: p1TagInp.value,
        p1Character: p1CharList.selectedOptions[0].text,
        p1Skin: p1RealSkin,
        p1Color: colorP1,
        p1Score: checkScore(p1Win1, p1Win2, p1Win3),
        p1WL: currentP1WL,
        p2Name: p2NameInp.value,
        p2Team: p2TagInp.value,
        p2Character: p2CharList.selectedOptions[0].text,
        p2Skin: p2RealSkin,
        p2Color: colorP2,
        p2Score: checkScore(p2Win1, p2Win2, p2Win3),
        p2WL: currentP2WL,
        bestOf: currentBestOf,
        round: roundInp.value,
        tournamentName: document.getElementById('tournamentName').value,
        caster1Name: document.getElementById('cName1').value,
        caster1Twitter: document.getElementById('cTwitter1').value,
        caster1Twitch: document.getElementById('cTwitch1').value,
        caster2Name: document.getElementById('cName2').value,
        caster2Twitter: document.getElementById('cTwitter2').value,
        caster2Twitch: document.getElementById('cTwitch2').value,
        allowIntro: document.getElementById('allowIntro').checked,
        workshop: workshopCheck.checked,
        forceHD: document.getElementById('forceHD').checked,
        noLoAHD: document.getElementById('noLoAHD').checked
    };

    //now convert it to a text we can save intro a file
    const data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(mainPath + "/ScoreboardInfo.json", data);


    //simple .txt files
    fs.writeFileSync(mainPath + "/Simple Texts/Player 1.txt", p1NameInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 2.txt", p2NameInp.value);

    fs.writeFileSync(mainPath + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Tournament Name.txt", document.getElementById('tournamentName').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Name.txt", document.getElementById('cName1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitter.txt", document.getElementById('cTwitter1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitch.txt", document.getElementById('cTwitch1').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Name.txt", document.getElementById('cName2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitter.txt", document.getElementById('cTwitter2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitch.txt", document.getElementById('cTwitch2').value);

}