'use strict';

const fs = require('fs');
const electron = require('electron');
const ipc = electron.ipcRenderer;

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})

// just in case we somehow go out of view
window.onscroll = () => { window.scroll(0, 0) };

// yes we all like global variables
const textPath = __dirname + '/Texts';
const charPathBase = __dirname + '/Characters';
const charPathWork = __dirname + '/Characters/_Workshop';
const charPathRandom = __dirname + '/Characters/Random';
let charPath;

const colorList = getJson(textPath + "/Color Slots");
let currentColors = [0, 0];

let scData; // we will store data to send to the browsers here
const pInfos = []; // player info that doesnt have exclusive inputs

let currentP1WL = "";
let currentP2WL = "";
let currentBestOf = "Bo5";

let gamemode = 1;

let movedSettings = false;

let inPF = false;
let currentFocus = -1;

let currentPlayer;

const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk


//preload  e v e r y t h i n g
const viewport = document.getElementById('viewport');
const overlayDiv = document.getElementById('overlay');
const goBackDiv = document.getElementById('goBack');
const pInfoDiv = document.getElementById("pInfoDiv");

const tNameInps = document.getElementsByClassName("teamName");

//we want the correct order, we cant use getClassName here
function pushArrayInOrder(array, string1, string2 = "") {
    for (let i = 0; i < maxPlayers; i++) {
        array.push(document.getElementById(string1+(i+1)+string2));
    }
}
const pNameInps = [], charSelectors = [], skinSelectors = [];
pushArrayInOrder(pNameInps, "p", "Name");
pushArrayInOrder(charSelectors, "p", "CharSelector");
pushArrayInOrder(skinSelectors, "p", "SkinSelector");


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
const forceHDCheck = document.getElementById('forceHD');
const noLoAHDCheck = document.getElementById('noLoAHD');
const forceWL = document.getElementById('forceWLToggle');
const forceAlt = document.getElementById("forceAlt");

const pFinder = document.getElementById("playerFinder");
const charFinder = document.getElementById("characterFinder");
const skinFinder = document.getElementById("skinFinder");


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
    forceAlt.addEventListener("click", saveGUISettings);
    forceHDCheck.addEventListener("click", HDtoggle);
    noLoAHDCheck.addEventListener("click", saveGUISettings);
    forceWL.addEventListener("click", forceWLtoggle);
    document.getElementById("alwaysOnTop").addEventListener("click", alwaysOnTop);
    document.getElementById("copyMatch").addEventListener("click", copyMatch);
    
    // load GUI settings
    const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));
    if (guiSettings.allowIntro) {document.getElementById("allowIntro").checked = true};
    if (guiSettings.workshop) {workshopCheck.checked = true} else {
        // disable alt arts checkbox
        forceAlt.disabled = true;
    };
    if (guiSettings.forceAlt) {forceAlt.checked = true};
    if (guiSettings.forceHD) {forceHDCheck.checked = true};
    if (guiSettings.noLoAHD) {noLoAHDCheck.checked = true; noLoAHDCheck.disabled = false};
    if (guiSettings.forceWL) {forceWL.click()};
    if (guiSettings.alwaysOnTop) {document.getElementById("alwaysOnTop").click()};


    //load color slot list and add the color background on each side
    loadColors();


    // we need to set the current char path
    workshopCheck.checked ? charPath = charPathWork : charPath = charPathBase;

    //load the character list on startup
    loadCharacters();

    //set listeners that will trigger when character or skin changes
    for (let i = 0; i < maxPlayers; i++) {
        charSelectors[i].addEventListener("click", () => {openCharSelector(i)});
        skinSelectors[i].addEventListener("click", () => {openSkinSelector(i)});
        // also set an initial character value
        charChange("Random", i);
    }
    // also set listeners for the input filters of char/skin selects
    charFinder.addEventListener("input", () => {filterFinder(charFinder)});
    skinFinder.addEventListener("input", () => {filterFinder(skinFinder)});
    

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


    // prepare the player finder (player presets)
    // if the mouse is hovering a player preset, let us know
    pFinder.addEventListener("mouseenter", () => { inPF = true });
    pFinder.addEventListener("mouseleave", () => { inPF = false });

    //for each player input field
    for (let i = 0; i < maxPlayers; i++) {

        //hide the player presets menu if text input loses focus
        pNameInps[i].addEventListener("focusout", () => {
            if (!inPF) { //but not if the mouse is hovering a player preset
                pFinder.style.display = "none";
            }
        });

        //check if theres a player preset every time we type or click in the player box
        pNameInps[i].addEventListener("input", () => {checkPlayerPreset(i)});
        pNameInps[i].addEventListener("focusin", () => {checkPlayerPreset(i)});

        //resize the container if it overflows
        pNameInps[i].addEventListener("input", resizeInput);

        // lets add in the init of the player info objects
        const pInfo = {
            pronouns : "",
            tag : "",
            twitter : "",
            twitch : "",
            yt : ""
        }
        pInfos.push(pInfo);

    }

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


    // finally, update the GUI on startup so we have something to send to browsers
    writeScoreboard();


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {

        // if a dropdown menu is open, click on the current focus
        if (pFinder.style.display == "block") {
            if (currentFocus > -1) {
                pFinder.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            if (currentFocus > -1) {
                charFinder.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            if (currentFocus > -1) {
                skinFinder.getElementsByClassName("finderEntry")[currentFocus].click();
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
        } else if (pFinder.style.display == "block") { // if a finder menu is open, close it
            pFinder.style.display = "none";
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block"
        || window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            document.activeElement.blur();
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => { giveWinP1() });
    Mousetrap.bind('f2', () => { giveWinP2() });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        if (pFinder.style.display == "block") {
            addActive(pFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), true);
        }
    });
    Mousetrap.bind('up', () => {
        if (pFinder.style.display == "block") {
            addActive(pFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), false);
        }
    });
}


function moveViewport() {
    if (!movedSettings) {
        viewport.style.transform = "translateX(-40%)";
        overlayDiv.style.opacity = ".25";
        goBackDiv.style.display = "block";
        goBackDiv.style.
        movedSettings = true;
    }
}

function goBack() {
    viewport.style.transform = "translateX(0)";
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

    // first of all, clear a possible already existing list
    charFinder.lastElementChild.innerHTML = "";

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

    // add random to the end of the character list
    characterList.push("Random")

    // add entries to the character list
    for (let i = 0; i < characterList.length; i++) {

        // this will be the div to click
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {charChange(characterList[i])});

        // character icon
        const imgIcon = document.createElement('img');
        imgIcon.className = "fIconImg";
        // check in case image cant be found
        if (fs.existsSync(charPath+"/"+characterList[i]+"/Icon.png")) {
            imgIcon.src = charPath+"/"+characterList[i]+"/Icon.png";
        } else {
            imgIcon.src = charPathRandom + '/Icon.png';
        }
        
        // character name
        const spanName = document.createElement('span');
        spanName.innerHTML = characterList[i];
        spanName.className = "pfName";

        //add them to the div we created before
        newDiv.appendChild(imgIcon);
        newDiv.appendChild(spanName);

        //and now add the div to the actual interface
        charFinder.lastElementChild.appendChild(newDiv);

    }

}

function openCharSelector(pNum) {
    
    // move the dropdown menu under the current char selector
    charSelectors[pNum].appendChild(charFinder);

    // focus the search input field and reset the list
    charFinder.firstElementChild.value = "";
    charFinder.firstElementChild.focus();
    filterFinder(charFinder);

    currentPlayer = pNum;
    currentFocus = -1;

}

// every time a character is clicked on the char list
function charChange(character, pNum = -1) {
    
    // clear focus to hide character select menu
    document.activeElement.blur();

    // clear filter box
    charFinder.firstElementChild.value = "";

    if (pNum != -1) {
        currentPlayer = pNum;
    }

    // update character selector text
    charSelectors[currentPlayer].children[1].innerHTML = character;

    // update character selector icon (making sure it exists)
    if (fs.existsSync(`${charPath}/${character}/Icon.png`)) {
        charSelectors[currentPlayer].children[0].src = `${charPath}/${character}/Icon.png`;
    } else {
        charSelectors[currentPlayer].children[0].src = `${charPathRandom}/Icon.png`;

    }

    // check the first skin of the list for this character
    const charInfo = getJson(`${charPath}/${character}/_Info`);
    let skin;

    if (charInfo) {

        // set the skin variable from the skin list
        skin = charInfo.skinList[0]
        // change the text of the skin selector
        skinSelectors[currentPlayer].innerHTML = skin;
        // if there's only 1 skin, dont bother displaying skin selector
        if (charInfo.skinList.length > 1) {
            skinSelectors[currentPlayer].style.display = "flex"
        } else {
            skinSelectors[currentPlayer].style.display = "none";
        }

    } else { // if it doesnt exist, hide the skin selector
        skinSelectors[currentPlayer].innerHTML = "";
        skinSelectors[currentPlayer].style.display = "none";
    }

    // change the background character image (only for first 2 players)
    if (currentPlayer < 2) {
        charImgChange(charImgs[currentPlayer], character, skin);
    }

}

function openSkinSelector(pNum) {

    // clear the list
    skinFinder.lastElementChild.innerHTML = "";

    // get the character skin list for this skin selector
    const character = charSelectors[pNum].getElementsByClassName("charSelectorText")[0].innerHTML;
    const charInfo = getJson(`${charPath}/${character}/_Info`);

    // for every skin on the skin list, add an entry
    for (let i = 0; i < charInfo.skinList.length; i++) {
        
        // this will be the div to click
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {skinChange(character, charInfo.skinList[i], pNum)});
        
        // character name
        const spanName = document.createElement('span');
        spanName.innerHTML = charInfo.skinList[i];
        spanName.className = "pfName";

        // add them to the div we created before
        newDiv.appendChild(spanName);

        // now for the character image, this is the mask/mirror div
        const charImgBox = document.createElement("div");
        charImgBox.className = "pfCharImgBox";

        // actual image
        const charImg = document.createElement('img');
        charImg.className = "pfCharImg";
        charImg.setAttribute('src', `${charPath}/${character}/${charInfo.skinList[i]}.png`);
        // we have to position it
        positionChar(character, charInfo.skinList[i], charImg);
        // and add it to the mask
        charImgBox.appendChild(charImg);

        //add it to the main div
        newDiv.appendChild(charImgBox);

        // and now add the div to the actual GUI
        skinFinder.lastElementChild.appendChild(newDiv);

    }

    // move the dropdown menu under the current skin selector
    skinSelectors[pNum].appendChild(skinFinder);

    // if this is the right side, change anchor point so it stays visible
    if (pNum%2 != 0) {
        skinFinder.style.right = "0px";
        skinFinder.style.left = "";
    } else {
        skinFinder.style.left = "0px";
        skinFinder.style.right = "";
    }

    // focus the search input field and clear its contents
    skinFinder.firstElementChild.value = "";
    skinFinder.firstElementChild.focus({preventScroll: true});

    currentPlayer = pNum;
    currentFocus = -1;
    
}

// every time a skin is clicked on the skin list
function skinChange(char, skin, pNum) {

    // update the text of the skin selector
    skinSelectors[pNum].innerHTML = skin
    
    // change the background character image (if first 2 players)
    if (pNum < 2) {
        charImgChange(charImgs[pNum], char, skin);
    }

    // remove focus from the skin list so it auto hides
    document.activeElement.blur();

}


// called whenever we type anything on the finders
function filterFinder(finder) {

    // we want to store the first entry starting with filter value
    let startsWith;

    // get the current text
    const filterValue = finder.getElementsByClassName("listSearch")[0].value;

    // for every entry on the list
    const finderEntries = finder.getElementsByClassName("searchList")[0].children;

    for (let i = 0; i < finderEntries.length; i++) {
        
        // find the name we are looking for
        const entryName = finderEntries[i].getElementsByClassName("pfName")[0].innerHTML;

        // if the name doesnt include the filter value, hide it
        if (entryName.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())) {
            finderEntries[i].style.display = "flex";
        } else {
            finderEntries[i].style.display = "none";
        }

        // if its starts with the value, store its position
        if (entryName.toLocaleLowerCase().startsWith(filterValue.toLocaleLowerCase()) && !startsWith) {
            startsWith = i;
        }

    }

    currentFocus = -1;

    // if no value, just remove any remaining active classes
    if (filterValue == "") {
        removeActiveClass(finder.getElementsByClassName("finderEntry"));
    } else {
        if (startsWith) currentFocus = startsWith - 1;
        addActive(finder.getElementsByClassName("finderEntry"), true);
    }

}


//change the image path depending on the character and skin
function charImgChange(charImg, charName, skinName) {
    // check if the file requested exists and add a placeholder if it doesnt
    if (fs.existsSync(`${charPath}/${charName}/${skinName}.png`)) {
        charImg.src = `${charPath}/${charName}/${skinName}.png`;
    } else {
        charImg.src = `${charPathRandom}/P2.png`;
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
        newRect.className = "colorInList";
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
                currentColors[0] = colorList[i];
            } else {
                currentColors[1] = colorList[i];
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
    currentP1WL = "";
    currentP2WL = "";

    const pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}


//called whenever the user types something in the player name box
function checkPlayerPreset(pNum) {

    //remove the "focus" for the player presets list
    currentFocus = -1;

    // move the player finder under the current player input
    pNameInps[pNum].parentElement.appendChild(pFinder);

    //clear the current list each time we type
    pFinder.innerHTML = "";

    // check for later
    let fileFound;

    //if we typed at least 3 letters
    if (pNameInps[pNum].value.length >= 3) {

        //check the files in that folder
        const files = fs.readdirSync(textPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(pNameInps[pNum].value.toLocaleLowerCase())) {

                // store that we found at least one preset
                fileFound = true;

                //un-hides the player presets div
                pFinder.style.display = "block";

                //go inside that file to get the player info
                const playerInfo = getJson(textPath + "/Player Info/" + file);
                //for each character that player plays
                playerInfo.characters.forEach(char => {

                    //this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    newDiv.addEventListener("click", () => {playerPreset(newDiv, pNum)});
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (playerInfo.tag != "") {
                        spanTag.innerHTML = playerInfo.tag;
                        spanTag.className = "pfTag";
                    }

                    //player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = file;
                    spanName.className = "pfName";

                    //player character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = char.character;
                    spanChar.className = "pfChar";

                    //we will use atributes to store data to read when clicked
                    newDiv.setAttribute("pronouns", playerInfo.pronouns);
                    newDiv.setAttribute("tag", playerInfo.tag);
                    newDiv.setAttribute("twitter", playerInfo.twitter);
                    newDiv.setAttribute("twitch", playerInfo.twitch);
                    newDiv.setAttribute("yt", playerInfo.yt);
                    newDiv.setAttribute("name", file);
                    newDiv.setAttribute("char", char.character);
                    newDiv.setAttribute("skin", char.skin);

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
                    pFinder.appendChild(newDiv);

                });
            }
        });
    }

    // if no presets were found, hide the player finder
    if (!fileFound) {
        pFinder.style.display = "none";
    }

    // if playing 2v2 and if the current player is on the right side
    if (gamemode == 2 && pNum%2 != 0) {
        // anchor point will be at the right side so it stays visible
        pFinder.style.right = "0px";
        pFinder.style.left = "";
    } else {
        pFinder.style.left = "0px";
        pFinder.style.right = "";
    }

}

// now the complicated "position character image" function!
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
function playerPreset(el, pNum) {

    pInfos[pNum].pronouns = el.getAttribute("pronouns");
    pInfos[pNum].tag = el.getAttribute("tag");
    pInfos[pNum].twitter = el.getAttribute("twitter");
    pInfos[pNum].twitch = el.getAttribute("twitch");
    pInfos[pNum].yt = el.getAttribute("yt");

    pNameInps[pNum].value = el.getAttribute("name");
    changeInputWidth(pNameInps[pNum]);

    charChange(el.getAttribute("char"), pNum);

    skinChange(el.getAttribute("char"), el.getAttribute("skin"), pNum);

    pFinder.style.display = "none";

}


// visual feedback to navigate menus with the keyboard
function addActive(x, direction) {
    
    removeActiveClass(x);

    // if true, were going up
    if (direction) {

        // increase that focus
        currentFocus++;
        // if end of list, cicle
        if (currentFocus >= x.length) currentFocus = 0;

        // search for the next visible entry
        while (currentFocus <= x.length-1) {
            if (x[currentFocus].style.display == "none") {
                currentFocus++;
            } else {
                break;
            }
        }
        // if we didnt find any, start from 0
        if (currentFocus == x.length) {
            currentFocus = 0;
            while (currentFocus <= x.length-1) {
                if (x[currentFocus].style.display == "none") {
                    currentFocus++;
                } else {
                    break;
                }
            }
        }
        // if even then we couldnt find a visible entry, set it to invalid
        if (currentFocus == x.length) {
            currentFocus = -1;
        }

    } else { // same as above but inverted
        currentFocus--;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        while (currentFocus > -1) {
            if (x[currentFocus].style.display == "none") {
                currentFocus--;
            } else {
                break;
            }
        }
        if (currentFocus == -1) {
            currentFocus = x.length-1;
            while (currentFocus > -1) {
                if (x[currentFocus].style.display == "none") {
                    currentFocus--;
                } else {
                    break;
                }
            }
        }
        if (currentFocus == x.length) {
            currentFocus = -1;
        }
    }

    // if there is a valid entry
    if (currentFocus > -1) {
        //add to the selected entry the active class
        x[currentFocus].classList.add("finderEntry-active");
        // make it scroll if it goes out of view
        x[currentFocus].scrollIntoView({block: "center"});
    }
    
}
function removeActiveClass(x) {
    //clears active from all entries
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
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


// when a player info button is clicked
function showPlayerInfo() {
    
    const pNum = this.getAttribute("player") - 1;

    document.getElementById("pInfoPNum").textContent = pNum + 1;

    document.getElementById("pInfoInputPronouns").value = pInfos[pNum].pronouns;
    document.getElementById("pInfoInputTag").value = pInfos[pNum].tag;
    document.getElementById("pInfoInputName").value = pNameInps[pNum].value;
    document.getElementById("pInfoInputTwitter").value = pInfos[pNum].twitter;
    document.getElementById("pInfoInputTwitch").value = pInfos[pNum].twitch;
    document.getElementById("pInfoInputYt").value = pInfos[pNum].yt;

    pInfoDiv.style.pointerEvents = "auto";
    pInfoDiv.style.opacity = 1;
    pInfoDiv.style.transform = "scale(1)";
    overlayDiv.style.opacity = .25;

}
function hidePlayerInfo() {
    pInfoDiv.style.pointerEvents = "none";
    pInfoDiv.style.opacity = 0;
    pInfoDiv.style.transform = "scale(1.15)";
    overlayDiv.style.opacity = 1;
}
function applyPlayerInfo() {
    
    const pNum = document.getElementById("pInfoPNum").textContent - 1;

    pInfos[pNum].pronouns = document.getElementById("pInfoInputPronouns").value;
    pInfos[pNum].tag = document.getElementById("pInfoInputTag").value;
    pNameInps[pNum].value = document.getElementById("pInfoInputName").value;
    pInfos[pNum].twitter = document.getElementById("pInfoInputTwitter").value;
    pInfos[pNum].twitch = document.getElementById("pInfoInputTwitch").value;
    pInfos[pNum].yt = document.getElementById("pInfoInputYt").value;

    changeInputWidth(pNameInps[pNum]);

}

function savePlayerPreset() {
    
    const pNum = document.getElementById("pInfoPNum").textContent - 1;

    const preset = pInfos[pNum];
    preset.characters = [];

    preset.characters.push({
        character: charSelectors[pNum].getElementsByClassName("charSelectorText")[0].innerHTML,
        skin: skinSelectors[pNum].innerText
    })

    fs.writeFileSync(`${textPath}/Player Info/${document.getElementById("pInfoInputName").value}.json`, JSON.stringify(preset, null, 2));

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

    // store 2v2 only elements
    const dubEls = document.getElementsByClassName("elGm2");

    //things are about to get messy
    if (gamemode == 1) {
        
        gamemode = 2;

        // change gamemode selector text
        this.innerText = "1v1";

        // display all 2v2 only elements
        for (let i = 0; i < dubEls.length; i++) {
            dubEls[i].style.display = "flex";
        }

        for (let i = 1; i < 3; i++) {
            //hide the background character image to reduce clutter
            charImgs[i-1].style.display = "none";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", tNameInps[i-1]);

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('pInfo'+i));
        }

        // change max width to the name inputs and char selects
        for (let i = 0; i < maxPlayers; i++) {

            pNameInps[i].style.maxWidth = "94px"
            
            charSelectors[i].style.maxWidth = "73px";
            skinSelectors[i].style.maxWidth = "72px";

        }

        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to Singles");

        //dropdown menus for the right side will now be positioned to the right
        document.getElementById("dropdownColorR").style.right = "0px";
        document.getElementById("dropdownColorR").style.left = "";

    } else if (gamemode == 2) {

        gamemode = 1;

        // change gamemode selector text
        this.innerText = "2v2";

        // hide all 2v2 only elements
        for (let i = 0; i < dubEls.length; i++) {
            dubEls[i].style.display = "none";
        }

        //move everything back to normal
        for (let i = 1; i < 3; i++) {
            charImgs[i-1].style.display = "block";

            document.getElementById('pInfo'+(i+2)).style.display = "none";

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            document.getElementById("scoreText"+i).style.display = "block";
        
            document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", document.getElementById('pInfo'+i));
        }

        for (let i = 0; i < maxPlayers; i++) {

            pNameInps[i].style.maxWidth = "210px"
            
            charSelectors[i].style.maxWidth = "141px";
            skinSelectors[i].style.maxWidth = "141px";
            
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
        const nameStore = pNameInps[i].value;
        pNameInps[i].value = pNameInps[i+1].value;
        pNameInps[i+1].value = nameStore;
        changeInputWidth(pNameInps[i]);
        changeInputWidth(pNameInps[i+1]);

        // player info
        const tempPInfo1 = pInfos[i];
        const tempPInfo2 = pInfos[i+1];
        pInfos[i] = tempPInfo2;
        pInfos[i+1] = tempPInfo1;

        //characters and skins
        const tempP1Char = charSelectors[i].getElementsByClassName("charSelectorText")[0].innerHTML;
        const tempP2Char = charSelectors[i+1].getElementsByClassName("charSelectorText")[0].innerHTML;
        const tempP1Skin = skinSelectors[i].innerText;
        const tempP2Skin = skinSelectors[i+1].innerText;
        // update the suff
        charChange(tempP2Char, i);
        charChange(tempP1Char, i+1);
        
        skinChange(tempP2Char, tempP2Skin, i);
        skinChange(tempP1Char, tempP1Skin, i+1);

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

        //clear player texts
        pNameInps[i].value = "";
        changeInputWidth(pNameInps[i]);
        
        // clear player info
        pInfos[i].pronouns = "";
        pInfos[i].tag = "";
        pInfos[i].twitter = "";
        pInfos[i].twitch = "";
        pInfos[i].yt = "";

        //reset characters to random
        charChange("Random", i);

    }

    //clear player scores
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
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
    // reload character lists
    loadCharacters();
    // clear current character lists
    for (let i = 0; i < maxPlayers; i++) {
        charChange("Random", i);
    }

    // disable or enable alt arts checkbox
    if (this.checked) {
        forceAlt.disabled = false;
    } else {
        forceAlt.disabled = true;
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
        if (pInfos[0].tag) {
            copiedText += pInfos[0].tag + " | ";
        }
        copiedText += pNameInps[0].value + " (" +  charSelectors[0].getElementsByClassName("charSelectorText")[0].innerHTML +") VS ";
        if (pInfos[1].tag) {
            copiedText += pInfos[1].tag + " | ";
        }
        copiedText += pNameInps[1].value + " (" +  charSelectors[1].getElementsByClassName("charSelectorText")[0].innerHTML +")";
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
    guiSettings.forceHD = forceHDCheck.checked;
    guiSettings.noLoAHD = noLoAHDCheck.checked;
    guiSettings.forceWL = forceWL.checked;
    guiSettings.alwaysOnTop = document.getElementById("alwaysOnTop").checked;

    // save the file
    fs.writeFileSync(textPath + "/GUI Settings.json", JSON.stringify(guiSettings, null, 2));

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
        allowIntro: document.getElementById('allowIntro').checked
    };

    //add the player's info to the player section of the json
    for (let i = 0; i < maxPlayers; i++) {

        // to simplify code
        const charname = charSelectors[i].getElementsByClassName("charSelectorText")[0].innerHTML;
        const charSkin = skinSelectors[i].innerText;
        // get the character position data
        let charPos = getJson(`${charPath}/${charname}/_Info`);

        // get us the path used by the browser sources
        let browserCharPath = "Characters";
        if (workshopCheck.checked) {
            browserCharPath = "Characters/_Workshop";
        }

        // set data for the scoreboard
        let scCharImg = `${charname}/${charSkin}.png`;
        let scCharPos = [];
        // if alt art is enabled, change the path
        if (forceAlt.checked) {
            scCharImg = `${charname}/Alt/${charSkin}.png`;
            // if an alt for this character can't be found, go back to regular path
            if (!fs.existsSync(`${__dirname}/${browserCharPath}/${scCharImg}`)) {
                scCharImg = `${charname}/${charSkin}.png`;
            }
        }
        // if the file doesnt exist, send the Random image
        let scImgFound = true;
        if (!fs.existsSync(`${__dirname}/${browserCharPath}/${scCharImg}`)) {
            scCharImg = `Resources/Characters/Random/P${(i % 2) + 1}.png`;
            scImgFound = false;
        } else {
            scCharImg = `Resources/${browserCharPath}/${scCharImg}`;
        }
        // get the character positions
        if (charPos && scImgFound) {
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
        let vsCharImg = `${charname}/${charSkin}.png`;
        let vsCharPos = [];
        let vsTrailImg;
        let vsBG = `${charname}/BG.webm`;
        // for HD skins
        let vsSkinUsed = charSkin;
        if (forceHDCheck.checked) {
            if (charSkin.includes("LoA") && !noLoAHDCheck.checked) {
                vsCharImg = `${charname}/LoA HD.png`;
                vsSkinUsed = "LoA HD";
            } else {
                vsCharImg = `${charname}/HD.png`;
                vsSkinUsed = "HD";
            }
            if (!fs.existsSync(`${__dirname}/${browserCharPath}/${vsCharImg}`)) {
                vsCharImg = `${charname}/${charSkin}.png`;
                vsSkinUsed = charSkin;
            }
        }
        // if the file doesnt exist, send the Random image
        let vsImgFound = true;
        if (!fs.existsSync(`${__dirname}/${browserCharPath}/${vsCharImg}`)) {
            vsCharImg = `Resources/Characters/Random/P${(i % 2) + 1}.png`;
            vsImgFound = false;
        } else {
            vsCharImg = `Resources/${browserCharPath}/${vsCharImg}`;
        }
        // get the character positions
        if (charPos && vsImgFound) {
            if (charPos.vsScreen[vsSkinUsed]) { // if the skin has a specific position
                vsCharPos[0] = charPos.vsScreen[vsSkinUsed].x;
                vsCharPos[1] = charPos.vsScreen[vsSkinUsed].y;
                vsCharPos[2] = charPos.vsScreen[vsSkinUsed].scale;
                vsTrailImg = `Resources/${browserCharPath}/${charname}/Trails/${currentColors[i%2].name} ${vsSkinUsed}.png`;
            } else { //if not, use a default position
                vsCharPos[0] = charPos.vsScreen.neutral.x;
                vsCharPos[1] = charPos.vsScreen.neutral.y;
                vsCharPos[2] = charPos.vsScreen.neutral.scale;
                vsTrailImg = `Resources/${browserCharPath}/${charname}/Trails/${currentColors[i%2].name}.png`;
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
            vsTrailImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // 1x1 transparent pixel
        }
        // oh we are still not done here, we need to check the BG
        if (charSkin.includes("LoA")) { // show LoA background if the skin is LoA
            vsBG = 'BG LoA.webm';
            browserCharPath = "Characters";
        } else if (charSkin == "Ragnir") { // Ragnir shows the default stage in the actual game
            vsBG = 'BG.webm';
            browserCharPath = "Characters";
        } else if (charname == "Shovel Knight" && charSkin == "Golden") { // why not
            vsBG = `${charname}/BG Golden.webm`;
        } else if (charPos) { // safety check
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
            pronouns: pInfos[i].pronouns,
            tag: pInfos[i].tag,
            name: pNameInps[i].value,
            twitter: pInfos[i].twitter,
            twitch: pInfos[i].twitch,
            yt: pInfos[i].yt,
            sc : {
                charImg: scCharImg,
                charPos: scCharPos
            },
            vs : {
                charImg: vsCharImg,
                charPos: vsCharPos,
                trailImg: vsTrailImg,
                bgVid: vsBG,
            }
        })
    }

    // stuff that needs to be done for both sides
    for (let i = 0; i < 2; i++) {
        // add color info
        scoreboardJson.color.push({
            name: currentColors[i].name,
            hex: currentColors[i].hex
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

    // now convert it into something readable to send to OBS
    scData = JSON.stringify(scoreboardJson, null, 2);
    sendData();


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

// when a new browser connects
ipc.on('requestData', () => {
    sendData();
})
// every time we need to send data to them browsers
function sendData() {
    ipc.send('sendData', scData);
}