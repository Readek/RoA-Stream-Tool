'use strict';

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})

// just in case we somehow go out of view
window.onscroll = () => { 
    window.scroll(0, 0)
};

// yes we all like global variables
const textPath = '/Texts';
const charPathBase = '/Characters';
const charPathWork = '/Characters/_Workshop';
const charPathRandom = '/Characters/Random';
let charPath;

let colorList;
let currentColors = [0, 0];

let scData; // we will store data to send to the browsers here
const pInfos = []; // player info that doesnt have exclusive inputs

let currentP1WL = "";
let currentP2WL = "";
let currentBestOf = 5;

let gamemode = 1;

let movedSettings = false;

let inPF = false;
let currentFocus = -1;

let currentPlayer;

const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk

let webSocket;

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

const scores = [];

const wlButtons = document.getElementsByClassName("wlButtons");
const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const roundInp = document.getElementById('roundName');
const tournamentInp = document.getElementById('tournamentName');

const casters = [];

const workshopCheck = document.getElementById('workshopToggle');
const forceHDCheck = document.getElementById('forceHD');
const noLoAHDCheck = document.getElementById('noLoAHD');
const forceWL = document.getElementById('forceWLToggle');
const scoreAutoUpdateCheck = document.getElementById("scoreAutoUpdate");
const invertScoreCheck = document.getElementById("invertScore");
const forceAlt = document.getElementById("forceAlt");

const charFinder = document.getElementById("characterFinder");
const skinFinder = document.getElementById("skinFinder");

const notifSpan = document.getElementById("notifText");


// commentator class
class Caster {

    constructor(el) {

        this.nameEl = el.getElementsByClassName(`cName`)[0];
        this.twitterEl = el.getElementsByClassName(`cTwitter`)[0];
        this.twitchEl = el.getElementsByClassName(`cTwitch`)[0];
        this.ytEl = el.getElementsByClassName(`cYt`)[0];

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
async function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", () => {writeScoreboard()});
    document.getElementById('settingsRegion').addEventListener("click", moveViewport);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", goBack);


    /* SETTINGS */

    //set listeners for the settings checkboxes
    workshopCheck.addEventListener("click", workshopToggle);
    forceHDCheck.addEventListener("click", HDtoggle);
    forceWL.addEventListener("click", forceWLtoggle);
    document.getElementById("copyMatch").addEventListener("click", copyMatch);
    

    //load color slot list and add the color background on each side
    colorList = await getJson(textPath + "/Color Slots");
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

    // some error handling
    charImgs[0].addEventListener("error", () => {charImgs[0].src = `${charPathRandom}/P2.png`});
    charImgs[1].addEventListener("error", () => {charImgs[1].src = `${charPathRandom}/P2.png`});
    for (let i = 0; i < charSelectors.length; i++) {
        charSelectors[i].children[0].addEventListener("error", () => {
            charSelectors[i].children[0].src = `${charPathRandom}/Icon.png`;
        })     
    }


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


    //for each player input field
    for (let i = 0; i < maxPlayers; i++) {

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


    // start the websockets connection with the GUI
    startWebsocket();


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {

        // if a dropdown menu is open, click on the current focus
        if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            if (currentFocus > -1) {
                charFinder.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            if (currentFocus > -1) {
                skinFinder.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else if (pInfoDiv.style.pointerEvents == "auto") { // if player info menu is up
            document.getElementById("pInfoApplyButt").click();
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
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block"
        || window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
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
        if (scoreAutoUpdateCheck.checked) {writeScoreboard()};
    });
    Mousetrap.bind('f2', () => {
        giveWin(1)
        if (scoreAutoUpdateCheck.checked) {writeScoreboard()};
    });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), true);
        }
    });
    Mousetrap.bind('up', () => {
        if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), false);
        }
    });
}


function moveViewport() {
    if (!movedSettings) {
        viewport.style.transform = "translateX(-240px)";
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
async function getJson(jPath) {
    try {
        const response = await (await fetch(jPath + ".json")).json();
        return response;
    } catch (e) {
        return null;
    }
    
}


//calls the main settings file and fills a combo list
async function loadCharacters() {

    // first of all, clear a possible already existing list
    charFinder.lastElementChild.innerHTML = "";

    // create a list with folder names on charPath
    const characterList = await getJson(textPath + "/Character List");

    // add entries to the character list
    for (let i = 0; i < characterList.length; i++) {

        // this will be the div to click
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {charChange(characterList[i])});

        // character icon
        const imgIcon = document.createElement('img');
        imgIcon.className = "fIconImg";
        imgIcon.src = `${charPath}/${characterList[i]}/Icons/Default.png`;
        // if the image doesnt load
        imgIcon.addEventListener("error", () => {imgIcon.src = `${charPathRandom}/Icon.png`});
        
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
async function charChange(character, pNum = -1) {
    
    // clear focus to hide character select menu
    document.activeElement.blur();

    // clear filter box
    charFinder.firstElementChild.value = "";

    if (pNum != -1) {
        currentPlayer = pNum;
    }
    
    // update character selector text
    charSelectors[currentPlayer].children[1].innerHTML = character;

    // update character selector icon
    charSelectors[currentPlayer].children[0].src = `${charPath}/${character}/Icons/Default.png`;

    // check the first skin of the list for this character
    const charInfo = await getJson(`${charPath}/${character}/_Info`);
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

async function openSkinSelector(pNum) {

    // clear the list
    skinFinder.lastElementChild.innerHTML = "";

    // get the character skin list for this skin selector
    const character = charSelectors[pNum].getElementsByClassName("charSelectorText")[0].innerHTML;
    const charInfo = await getJson(`${charPath}/${character}/_Info`);

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
        // we have to position it (get the char info first)
        positionChar(charInfo.skinList[i], charImg, charInfo);
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
    if (pNum%2 != 0 && window.innerWidth > 600) {
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

    // check if an icon for this skin exists
    charSelectors[currentPlayer].children[0].src = `${charPath}/${char}/Icons/Default.png`;

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
    charImg.src = `${charPath}/${charName}/${skinName}.png`;
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
function updateColorManual(color, pNum) {

    const side = (pNum % 2) ? "r" : "l";

    const colorRectangle = document.getElementById(side+"ColorRect");
    const colorGrad = document.getElementById(side+"Side");
    
    currentColors[pNum] = color;

    colorRectangle.style.backgroundColor = color.hex;
    colorGrad.style.backgroundImage = "linear-gradient(to bottom left, "+color.hex+"50, #00000000, #00000000)";

}


// score hotkeys function
function giveWin(num) {
    
    if (invertScoreCheck.checked) {
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


// now the complicated "position character image" function!
async function positionChar(skin, charEL, charInfo) {

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

    // display the current info for this player
    document.getElementById("pInfoInputPronouns").value = pInfos[pNum].pronouns;
    document.getElementById("pInfoInputTag").value = pInfos[pNum].tag;
    document.getElementById("pInfoInputName").value = pNameInps[pNum].value;
    document.getElementById("pInfoInputTwitter").value = pInfos[pNum].twitter;
    document.getElementById("pInfoInputTwitch").value = pInfos[pNum].twitch;
    document.getElementById("pInfoInputYt").value = pInfos[pNum].yt;

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
    overlayDiv.style.opacity = .25;

}
function hidePlayerInfo() {
    pInfoDiv.style.pointerEvents = "none";
    pInfoDiv.style.opacity = 0;
    pInfoDiv.style.transform = "scale(1.15)";
    overlayDiv.style.opacity = 1;

    document.getElementById("pInfoInputPronouns").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTag").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputName").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTwitter").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputTwitch").setAttribute("tabindex", "-1");
    document.getElementById("pInfoInputYt").setAttribute("tabindex", "-1");
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
        this.innerText = "1v1";

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


async function swap() {

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
        await charChange(tempP2Char, i);
        await charChange(tempP1Char, i+1);
        
        skinChange(tempP2Char, tempP2Skin, i);
        skinChange(tempP1Char, tempP1Skin, i+1);

    }    

    //scores
    const tempP1Score = scores[0].getScore();
    const tempP2Score = scores[1].getScore();
    scores[0].setScore(tempP2Score);
    scores[1].setScore(tempP1Score)

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

async function clearPlayers() {

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
        await charChange("Random", i);

    }

    //clear player scores
    for (let i = 0; i < scores.length; i++) {
        scores[i].setScore(0);
    }

}


//called whenever the user clicks on the workshop toggle
function workshopToggle() {

    // set a new character path
    charPath = workshopCheck.checked ? charPathWork : charPathBase;
    // reload character lists
    loadCharacters();
    // clear current character lists
    for (let i = 0; i < maxPlayers; i++) {
        charChange("Random", i);
    }

    // disable or enable alt arts checkbox
    if (workshopCheck.checked) {
        forceAlt.disabled = false;
    } else {
        forceAlt.disabled = true;
    }

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

}

// whenever the user clicks on the HD renders checkbox
function HDtoggle() {

    // enables or disables the second forceHD option
    if (this.checked) {
        noLoAHDCheck.disabled = false;
    } else {
        noLoAHDCheck.disabled = true;
    }

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


//time to write it down
function writeScoreboard(send = true) {

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
        altSkin: forceAlt.checked,
        forceHD: forceHDCheck.checked,
        noLoAHD: noLoAHDCheck.checked,
        workshop: workshopCheck.checked,
        forceWL: forceWL.checked
    };

    //add the player's info to the player section of the json
    for (let i = 0; i < maxPlayers; i++) {

        // to simplify code
        const charname = charSelectors[i].getElementsByClassName("charSelectorText")[0].innerHTML;
        const charSkin = skinSelectors[i].innerText;

        // finally, add it to the main json
        scoreboardJson.player.push({
            pronouns: pInfos[i].pronouns,
            tag: pInfos[i].tag,
            name: pNameInps[i].value,
            twitter: pInfos[i].twitter,
            twitch: pInfos[i].twitch,
            yt: pInfos[i].yt,

            char: charname,
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

    if (send) {
        sendData()
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


// every time we need to send data to them browsers
function sendData() {
    
    webSocket.send(scData);
}

// when we get data remotely, update GUI
async function getData(newJson) {

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
    if (newJson.workshop != workshopCheck.checked) {
        if (newJson.workshop) {
            workshopCheck.checked = true;
        } else {
            workshopCheck.checked = false;
        }
        workshopToggle();
    } else {
        if (newJson.workshop) {
            workshopCheck.checked = true;
        } else {
            workshopCheck.checked = false;
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
        pNameInps[i].value = newJson.player[i].name;
        pInfos[i].pronouns = newJson.player[i].pronouns;
        pInfos[i].tag = newJson.player[i].tag;
        pInfos[i].twitter = newJson.player[i].twitter;
        pInfos[i].twitch = newJson.player[i].twitch;
        pInfos[i].yt = newJson.player[i].yt;

        // player character and skin
        await charChange(newJson.player[i].char, i);
        skinChange(newJson.player[i].char, newJson.player[i].skin, i);

    };


    for (let i = 0; i < 2; i++) {
        
        // stuff for each side
        scores[i].setScore(newJson.score[i]);
        tNameInps[i].value = newJson.teamName[i];
        updateColorManual(newJson.color[i], i);
        
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
    writeScoreboard(false);
    displayNotif("GUI was remotely updated");

}


function startWebsocket() {

    document.getElementById("updateButtonText").textContent = "RECONNECTING";
	// we need to connect to the websocket server
	webSocket = new WebSocket("ws://"+window.location.hostname+":8080");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
            document.getElementById("updateButtonText").textContent = "UPDATE";
			getData(JSON.parse(event.data))
		}
	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {
        displayNotif("Connection error, please reconnect.")
        document.getElementById("updateButtonText").textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
        
    }
	// if connection fails for any reason
	webSocket.onerror = () => {
        displayNotif("Connection error, please reconnect.")
        document.getElementById("updateButtonText").textContent = "RECONNECT";
        document.getElementById('updateRegion').removeEventListener("click", () => {writeScoreboard()})
        document.getElementById('updateRegion').addEventListener("click", () => {startWebsocket()})
    }

}
