'use strict';

// import electron stuff
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
});

// just in case we somehow go out of view
window.onscroll = () => { window.scroll(0, 0) };

// yes we all like global variables
const textPath = __dirname + '/Texts';
const charPathBase = __dirname + '/Characters';
const charPathWork = __dirname + '/Characters/_Workshop';
const charPathRandom = __dirname + '/Characters/Random';
let charPath;

let colorList;
let currentColors = [0, 0];

let scData; // we will store data to send to the browsers here

let currentP1WL = "", currentP2WL = "";
let currentBestOf = 5;

let gamemode = 1;

let inSettings = false;
let inPF = false;
let inBracket = false;
let currentFocus = -1;
let presName; // to break playerpreset cycle

let currentPlayer;

const maxPlayers = 4; //change this if you ever want to remake this into singles only or 3v3 idk


//preload  e v e r y t h i n g
const viewport = document.getElementById('viewport');
const overlayDiv = document.getElementById('overlay');
const goBackDiv = document.getElementById('goBack');
const pInfoDiv = document.getElementById("pInfoDiv");
const customSkinDiv = document.getElementById("customSkinDiv");

const tNameInps = document.getElementsByClassName("teamName");

const players = [];

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

const pFinder = document.getElementById("playerFinder");
const charFinder = document.getElementById("characterFinder");
const skinFinder = document.getElementById("skinFinder");
const cFinder = document.getElementById("casterFinder");

const notifSpan = document.getElementById("notifText");


// player class!
class Player {

    constructor(id) {

        this.pNum = id;
        this.nameInp = document.getElementById(`p${id}Name`);
        this.charSel = document.getElementById(`p${id}CharSelector`);
        this.skinSel = document.getElementById(`p${id}SkinSelector`);
        
        this.tag = "";
        this.pronouns = "";
        this.twitter = "";
        this.twitch = "";
        this.yt = "";

        this.char = "";
        this.skin = "";
        this.vsSkin = "";
        this.charInfo;
        this.iconSrc = "";
        this.scSrc = "";
        this.scBrowserSrc = "";
        this.vsSrc = "";
        this.vsBrowserSrc = "";

        this.randomImg = (this.pNum-1)%2 ? "P2" : "P1";


        // hide the player presets menu if text input loses focus
        this.nameInp.addEventListener("focusout", () => {
            if (!inPF) { //but not if the mouse is hovering a player preset
                pFinder.style.display = "none";
            }
        });

        //check if theres a player preset every time we type or click in the player box
        this.nameInp.addEventListener("input", () => {checkPlayerPreset(id-1)});
        this.nameInp.addEventListener("focusin", () => {checkPlayerPreset(id-1)});

        //resize the container if it overflows
        this.nameInp.addEventListener("input", resizeInput);


        // set listeners that will trigger when character or skin changes
        this.charSel.addEventListener("click", () => {openCharSelector(this.charSel, id-1)});
        this.skinSel.addEventListener("click", () => {openSkinSelector(id-1)});
        // also set an initial character value
        this.charChange("Random");

    }

    getName() {
        return this.nameInp.value;
    }
    setName(name) {
        this.nameInp.value = name;
    }

    async charChange(character, notDefault) {

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
        this.vsSkin = skin;

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

        // get us that scoreboard image
        this.scSrc = await this.getRecolorImage(
            this.char,
            skin,
            this.charInfo.ogColor,
            this.charInfo.colorRange,
            "Skins/",
            this.randomImg
        );
        this.scBrowserSrc = this.getBrowserSrc(this.char, skin, "Skins/", this.randomImg);

        // if we want HD skins, get us those for the VS screen
        if (forceHDCheck.checked) {
            if (skin.name.includes("LoA") && !noLoAHDCheck.checked) {
                this.vsSrc = await this.getRecolorImage(this.char, {name: "LoA HD"}, "Skins/", this.randomImg);
                this.vsBrowserSrc = this.getBrowserSrc(this.char, {name: "LoA HD"}, "Skins/", this.randomImg);
                this.vsSkin = {name: "LoA HD"};
            } else {
                this.vsSrc = await this.getRecolorImage(this.char, {name: "HD"}, "Skins/", this.randomImg);
                this.vsBrowserSrc = this.getBrowserSrc(this.char, {name: "HD"}, "Skins/", this.randomImg);
                this.vsSkin = {name: "HD"};
            }
        } else {
            this.vsSrc = this.scSrc;
            this.vsBrowserSrc = this.scBrowserSrc;
            this.vsSkin = skin;
        }

        // change the background character image (if first 2 players)
        if (this.pNum-1 < 2) {
            charImgs[this.pNum-1].src = this.scSrc;
            if (this.char == "Random" && this.pNum == 1) {
                charImgs[this.pNum-1].src = `${charPathRandom}/P2.png`;
            }
        }

        // set up a trail for the vs screen
        this.setTrailImage();

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

            // if the skin list isnt being shown, break the cycle
            if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "none") {
                break;
            }
            // add the final image
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

    async getTrailImage(char, skin, color) {
        if (fs.existsSync(`${charPath}/${char}/Skins/${skin}.png`)) {
            return await getRoARecolor(
                "Trail",
                `${charPath}/${char}/Skins/${skin}.png`,
                [127, 127, 127, 1, 0,0,0,0], // any color would do
                [360, 100, 100, 1, 0,0,0,0], // range picks up all colors
                color,
                true // with blend true, only 1 color will be applied to everything
            )
        } else if (fs.existsSync(`${charPath}/${char}/Skins/Default.png`)) {
            return await getRoARecolor(
                "Trail",
                `${charPath}/${char}/Skins/Default.png`,
                [127, 127, 127, 1, 0,0,0,0],
                [360, 100, 100, 1, 0,0,0,0],
                color,
                true
            )
        } else {
            // 1x1 transparent pixel
            return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        }
    }

    async setTrailImage() {
        // we add "FFFFFF" to the color to avoid shader issues when using only 1 color
        const color = currentColors[(this.pNum-1)%2].hex.substring(1)+"FFFFFF";
        this.trailSrc = await this.getTrailImage(this.char, this.vsSkin.name, color);
    }

    getBrowserSrc(char, skin, extraPath, failPath) {
        let browserCharPath = "Resources/Characters";
        if (workshopCheck.checked) {
            browserCharPath = "Resources/Characters/_Workshop";
        }
        
        if (fs.existsSync(`${charPath}/${char}/${extraPath}${skin.name}.png`) && !skin.force) {
            return browserCharPath + `/${char}/${extraPath}${skin.name}.png`;
        } else if (fs.existsSync(`${charPath}/${char}/${extraPath}Default.png`)) {
            if (skin.hex) {
                return null;
            } else {
                return browserCharPath + `/${char}/${extraPath}Default.png`;
            }
        } else {
            return `Resources/Characters/Random/${failPath}.png`;;
        }
    }

}


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
            checkCasterPreset(this);

        });

        // if we click on the name text input
        this.nameEl.addEventListener("focusin", () => {checkCasterPreset(this)});
        // hide the presets dropdown if text input loses focus
        this.nameEl.addEventListener("focusout", () => {
            if (!inPF) { // but not if the mouse is hovering a preset
                cFinder.style.display = "none";
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
            fs.writeFileSync(`${textPath}/Commentator Info/${this.getName()}.json`, JSON.stringify(preset, null, 2));

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

// (more classes may be created in future releases maybe?)

init();
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
    document.getElementById('settingsRegion').addEventListener("click", () => {moveViewport("settings")});
    document.getElementById('botBarBracket').addEventListener("click", () => {moveViewport("bracket")});


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
    scoreAutoUpdateCheck.addEventListener("click", saveGUISettings);
    invertScoreCheck.addEventListener("click", saveGUISettings);
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
    if (guiSettings.scoreAutoUpdate) {scoreAutoUpdateCheck.checked = true};
    if (guiSettings.invertScore) {invertScoreCheck.checked = true};
    if (guiSettings.alwaysOnTop) {document.getElementById("alwaysOnTop").click()};


    //load color slot list and add the color background on each side
    loadColors();


    // we need to set the current char path
    workshopCheck.checked ? charPath = charPathWork : charPath = charPathBase;


    // set listeners for the input filters of char/skin selects
    charFinder.addEventListener("input", () => {filterFinder(charFinder)});
    skinFinder.addEventListener("input", () => {filterFinder(skinFinder)});


    // initialize our player class
    for (let i = 0; i < maxPlayers; i++) {
        players.push(new Player(i+1));
    }

    
    // initialize the character list
    loadCharacters();


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


    // prepare the player finder (player presets)
    // if the mouse is hovering a player preset, let us know
    pFinder.addEventListener("mouseenter", () => { inPF = true });
    pFinder.addEventListener("mouseleave", () => { inPF = false });


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


    // set listeners for the custom skins menu
    document.getElementById("customSkinBackButt").addEventListener("click", hideCustomSkin);
    document.getElementById("customSkinApplyButt").addEventListener("click", () => {customChange()});


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
    // set up the caster finders
    cFinder.addEventListener("mouseenter", () => { inPF = true });
    cFinder.addEventListener("mouseleave", () => { inPF = false });


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
        } else if (window.getComputedStyle(cFinder).getPropertyValue("display") == "block") {
            if (currentFocus > -1) {
                cFinder.getElementsByClassName("finderEntry")[currentFocus].click();
            }
        } else if (pInfoDiv.style.pointerEvents == "auto") { // if player info menu is up
            document.getElementById("pInfoApplyButt").click();
        } else if (inBracket) {
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
        if (inSettings || inBracket) { //if settings are open, close them
            goBack();
        } else if (pFinder.style.display == "block") { // if a finder menu is open, close it
            pFinder.style.display = "none";
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
        if (pFinder.style.display == "block") {
            addActive(pFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), true);
        } else if (window.getComputedStyle(cFinder).getPropertyValue("display") == "block") {
            addActive(cFinder.getElementsByClassName("finderEntry"), true);
        }
    });
    Mousetrap.bind('up', () => {
        if (pFinder.style.display == "block") {
            addActive(pFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(charFinder).getPropertyValue("display") == "block") {
            addActive(charFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
            addActive(skinFinder.getElementsByClassName("finderEntry"), false);
        } else if (window.getComputedStyle(cFinder).getPropertyValue("display") == "block") {
            addActive(cFinder.getElementsByClassName("finderEntry"), false);
        }
    });
}


function moveViewport(where) {

    overlayDiv.style.opacity = ".25";

    if (where == "settings") {
        viewport.style.transform = "translateX(-240px)";
        goBackDiv.style.display = "block";
        inSettings = true;
    } else {
        viewport.style.transform = "translateX(100%)";
        inBracket = true;
    }
        
}

function goBack() {
    viewport.style.transform = "translateX(0)";
    overlayDiv.style.opacity = "1";
    goBackDiv.style.display = "none";
    inSettings = false;
    inBracket = false;
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
async function loadCharacters() {

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

        // get us the charInfo for this character
        const charInfo = getJson(`${charPath}/${characterList[i]}/_Info`);

        // this will be the div to click
        const newDiv = document.createElement('div');
        newDiv.className = "finderEntry";
        newDiv.addEventListener("click", () => {charChange(characterList[i])});

        // character icon
        const imgIcon = document.createElement('img');
        imgIcon.className = "fIconImg";
        // check if the character exists
        let skin = {name: "Default"}, ogColor, colorRange;
        if (charInfo) {
            skin = charInfo.skinList[0];
            ogColor = charInfo.ogColor;
            colorRange = charInfo.colorRange;
        }
        // this will get us the true default icon for any character
        imgIcon.src = await players[0].getRecolorImage(
            characterList[i],
            skin,
            ogColor,
            colorRange,
            "Icons/",
            "Icon"
        );
        
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

    // this is just so Remote Update has a character list
    fs.writeFileSync(`${textPath}/Character List.json`, JSON.stringify(characterList, null, 2));

}

function openCharSelector(charSel, pNum) {
    
    // move the dropdown menu under the current char selector
    charSel.appendChild(charFinder);

    // focus the search input field and reset the list
    charFinder.firstElementChild.value = "";
    charFinder.firstElementChild.focus();
    filterFinder(charFinder);

    currentPlayer = pNum;
    currentFocus = -1;

    // if in bracket view, invert anchor point so it stays visible
    if (inBracket && pNum > 1 && bracketPlayers.length > 2) {
        charFinder.style.top = "auto";
        charFinder.style.bottom = "100%";
    } else if (inBracket && pNum > 0 && bracketPlayers.length <= 2) {
        charFinder.style.top = "auto";
        charFinder.style.bottom = "100%";
    } else {
        charFinder.style.top = "100%";
        charFinder.style.bottom = "auto";
    }

}

// every time a character is clicked on the char list
function charChange(character, pNum = -1, notDefault) {
    
    // clear focus to hide character select menu
    document.activeElement.blur();

    // clear filter box
    charFinder.firstElementChild.value = "";

    if (pNum != -1) {
        currentPlayer = pNum;
    }

    // our player class will take things from here
    if (inBracket) {
        bracketPlayers[currentPlayer].charChange(character, notDefault);
    } else {
        players[currentPlayer].charChange(character, notDefault);
    }

}

function openSkinSelector(pNum) {

    // move the dropdown menu under the current skin selector
    if (inBracket) {
        bracketPlayers[pNum].skinSel.appendChild(skinFinder);
    } else {
        players[pNum].skinSel.appendChild(skinFinder);
    }

    // only do this if skin list is being shown
    if (window.getComputedStyle(skinFinder).getPropertyValue("display") == "block") {
        
        // clear the list
        skinFinder.lastElementChild.innerHTML = "";

        // now populate it
        if (inBracket) {
            bracketPlayers[pNum].fillSkinList();
        } else {
            players[pNum].fillSkinList();
        }

        // if this is the right side, change anchor point so it stays visible
        if (pNum%2 != 0 && window.innerWidth > 600 && !inBracket) {
            skinFinder.style.right = "0px";
            skinFinder.style.left = "";
        } else {
            skinFinder.style.left = "0px";
            skinFinder.style.right = "";
        }
        // if in bracket view, invert anchor point so it stays visible
        if (inBracket && pNum > 1 && bracketPlayers.length > 2) {
            skinFinder.style.top = "auto";
            skinFinder.style.bottom = "100%";
        } else if (inBracket && pNum > 0 && bracketPlayers.length <= 2) {
            skinFinder.style.top = "auto";
            skinFinder.style.bottom = "100%";
        } else {
            skinFinder.style.top = "100%";
            skinFinder.style.bottom = "auto";
        }

        // focus the search input field and clear its contents
        skinFinder.firstElementChild.value = "";
        skinFinder.firstElementChild.focus({preventScroll: true});

        currentPlayer = pNum;
        currentFocus = -1;

    }
    
}

// for those times the skin list just isnt enough
function customChange(hex) {

    let skinHex = document.getElementById("customSkinInput").value;
    if (hex) {
        skinHex = hex;
    }
    const skin = {
        name: "Custom",
        hex: skinHex
    };
    if (inBracket) {
        bracketPlayers[currentPlayer].skinChange(skin);
    } else {
        players[currentPlayer].skinChange(skin);
    }
    hideCustomSkin();

}

// whenever the user clicks on the "Custom Skin" skin entry
function showCustomSkin(pNum) {

    document.getElementById("customSkinInput").focus();

    document.getElementById("customSkinCharSpan").textContent = players[pNum-1].char;
    document.getElementById("customSkinInput").value = "";

    customSkinDiv.style.pointerEvents = "auto";
    customSkinDiv.style.opacity = 1;
    customSkinDiv.style.transform = "scale(1)";
    overlayDiv.style.opacity = .25;

}
function hideCustomSkin() {
    customSkinDiv.style.pointerEvents = "none";
    customSkinDiv.style.opacity = 0;
    customSkinDiv.style.transform = "scale(1.15)";
    overlayDiv.style.opacity = 1;
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


//will load the color list to a color slot combo box
function loadColors() {

    colorList = getJson(textPath + "/Color Slots");

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

    // generate new trails for existing characters
    for (let i = 0; i < players.length; i+=2) {
        if (side == "l") {
            players[i].setTrailImage();
        } else {
            players[i+1].setTrailImage();
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


//called whenever the user types something in the player name box
async function checkPlayerPreset(pNum) {

    //remove the "focus" for the player presets list
    currentFocus = -1;

    let curPlayer;
    // determine the current player class
    if (inBracket) {
        curPlayer = bracketPlayers[pNum];
    } else {
        curPlayer = players[pNum];
    }

    // move the player finder under the current player input
    curPlayer.nameInp.parentElement.appendChild(pFinder);


    //clear the current list each time we type
    pFinder.innerHTML = "";

    // check for later
    let fileFound;
    const skinImgs = [];

    let currentPresName;

    //if we typed at least 3 letters
    if (curPlayer.getName().length >= 3) {

        //check the files in that folder
        const files = fs.readdirSync(textPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(curPlayer.getName().toLocaleLowerCase())) {

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
                    newDiv.setAttribute("hex", char.hex);

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
                    const charJson = getJson(charPath + "/" + char.character + "/_Info");
                    // we will store this for later
                    skinImgs.push({
                        el : charImg,
                        charJson : charJson,
                        char : char.character,
                        skin : char.skin,
                        hex : char.hex
                    });
                    //we have to position it
                    positionChar(char.skin, charImg, charJson);
                    //and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    //and now add the div to the actual interface
                    pFinder.appendChild(newDiv);

                    // we need this to know which cycle we're in
                    presName = curPlayer.getName();

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

    // now lets add those images to each entry
    currentPresName = presName;
    for (let i = 0; i < skinImgs.length; i++) {

        // if the list isnt being shown, break the cycle
        if (presName != currentPresName ||
        window.getComputedStyle(pFinder).getPropertyValue("display") == "none") {
            break;
        }

        let skin;
        if (skinImgs[i].charJson) {
            if (skinImgs[i].skin == "Custom") {
                skin = {name: "Custom", hex: skinImgs[i].hex}
            } else {
                for (let j = 0; j < skinImgs[i].charJson.skinList.length; j++) {
                    if (skinImgs[i].charJson.skinList[j].name == skinImgs[i].skin) {
                        skin = skinImgs[i].charJson.skinList[j];
                    }
                }
            }
        } else {
            skin = {name: skinImgs[i].skin}
        }
        
        let finalColIn = null;
        let finalColRan = null;
        if (skinImgs[i].charJson) {
            finalColIn = skinImgs[i].charJson.ogColor;
            finalColRan = skinImgs[i].charJson.colorRange;
        }
        const finalSrc = await players[0].getRecolorImage(
            skinImgs[i].char,
            skin,
            finalColIn,
            finalColRan,
            "Skins/",
            "P2"
        );
        skinImgs[i].el.setAttribute('src', finalSrc);

    }

}

// now the complicated "position character image" function!
async function positionChar(skin, charEL, pos) {
	
	//               x, y, scale
	const charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (pos) {
		if (pos.gui[skin]) { //if the skin has a specific position
			charPos[0] = pos.gui[skin].x;
			charPos[1] = pos.gui[skin].y;
			charPos[2] = pos.gui[skin].scale;
		} else { //if none of the above, use a default position
			charPos[0] = pos.gui.neutral.x;
			charPos[1] = pos.gui.neutral.y;
			charPos[2] = pos.gui.neutral.scale;
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

    let curPlayer;
    if (inBracket) {
        curPlayer = bracketPlayers[pNum];
    } else {
        curPlayer = players[pNum];
    }

    curPlayer.pronouns = el.getAttribute("pronouns");
    curPlayer.twitter = el.getAttribute("twitter");
    curPlayer.twitch = el.getAttribute("twitch");
    curPlayer.yt = el.getAttribute("yt");

    curPlayer.setName(el.getAttribute("name"));
    if (!inBracket) {
        curPlayer.tag = el.getAttribute("tag");
        changeInputWidth(curPlayer.nameInp);
    } else {
        curPlayer.setTag(el.getAttribute("tag"));
    }


    charChange(el.getAttribute("char"), pNum, true);

    if (el.getAttribute("skin") == "Custom") {
        customChange(el.getAttribute("hex"));
    } else {
        for (let i = 0; i < curPlayer.charInfo.skinList.length; i++) {
            if (curPlayer.charInfo.skinList[i].name == el.getAttribute("skin")) {
                curPlayer.skinChange(curPlayer.charInfo.skinList[i]);
            }
        }
    }

    pFinder.style.display = "none";

}


// called whenever the user types something in a commentator name box
function checkCasterPreset(el) {

    // this is mostly copy paste from player preset code
    currentFocus = -1;
    el.nameEl.parentElement.appendChild(cFinder);
    cFinder.innerHTML = "";
    let fileFound;

    if (el.getName().length >= 3) {

        const files = fs.readdirSync(textPath + "/Commentator Info/");
        files.forEach(file => {

            file = file.substring(0, file.length - 5);

            if (file.toLocaleLowerCase().includes(el.getName().toLocaleLowerCase())) {

                fileFound = true;
                cFinder.style.display = "block";

                const casterInfo = getJson(textPath + "/Commentator Info/" + file);

                const newDiv = document.createElement('div');
                newDiv.className = "finderEntry";
                newDiv.addEventListener("click", () => {casterPreset(newDiv, el)});

                const spanName = document.createElement('span');
                spanName.innerHTML = file;
                spanName.className = "pfName";

                newDiv.setAttribute("twitter", casterInfo.twitter);
                newDiv.setAttribute("twitch", casterInfo.twitch);
                newDiv.setAttribute("yt", casterInfo.yt);
                newDiv.setAttribute("name", file);

                newDiv.appendChild(spanName);

                cFinder.appendChild(newDiv);

            }
        });
    }

    if (!fileFound) {
        cFinder.style.display = "none";
    }

}

//called when the user clicks on a player preset
function casterPreset(clickDiv, caster) {

    caster.setName(clickDiv.getAttribute("name"));
    caster.setTwitter(clickDiv.getAttribute("twitter"));
    caster.setTwitch(clickDiv.getAttribute("twitch"));
    caster.setYt(clickDiv.getAttribute("yt"));

    cFinder.style.display = "none";

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
    currentPlayer = pNum;

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

    players[pNum].pronouns = document.getElementById("pInfoInputPronouns").value;
    players[pNum].tag = document.getElementById("pInfoInputTag").value;
    players[pNum].nameInp.value = document.getElementById("pInfoInputName").value;
    players[pNum].twitter = document.getElementById("pInfoInputTwitter").value;
    players[pNum].twitch = document.getElementById("pInfoInputTwitch").value;
    players[pNum].yt = document.getElementById("pInfoInputYt").value;

    changeInputWidth(players[pNum].nameInp);

}

function savePlayerPreset() {
    
    const pNum = currentPlayer;

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
    if (fs.existsSync(`${textPath}/Player Info/${document.getElementById("pInfoInputName").value}.json`)) {
        
        const existingPreset = getJson(`${textPath}/Player Info/${document.getElementById("pInfoInputName").value}`);
        // add existing characters to the new json, but not if the character is the same
        for (let i = 0; i < existingPreset.characters.length; i++) {
            if (existingPreset.characters[i].character != players[pNum].char) {
                preset.characters.push(existingPreset.characters[i]);
            }
        }

    }

    fs.writeFileSync(`${textPath}/Player Info/${document.getElementById("pInfoInputName").value}.json`, JSON.stringify(preset, null, 2));

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
        changeInputWidth(players[i].nameInp);
        changeInputWidth(players[i+1].nameInp);

        // player info
        swapVariables(players[i].tag, players[i+1].tag);
        swapVariables(players[i].pronouns, players[i+1].pronouns);
        swapVariables(players[i].twitter, players[i+1].twitter);
        swapVariables(players[i].twitch, players[i+1].twitch);
        swapVariables(players[i].yt, players[i+1].yt);

        //characters and skins
        const tempP1Char = players[i].char;
        const tempP2Char = players[i+1].char;
        const tempP1Skin = players[i].skin;
        const tempP2Skin = players[i+1].skin;
        // update the stuff
        charChange(tempP2Char, i, true);
        charChange(tempP1Char, i+1, true);
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
// just so code looks a bit more clean
function swapVariables(var1, var2) {
    [var1, var2] = [var2, var1];
}

function clearPlayers() {

    //crear the team names
    for (let i = 0; i < tNameInps.length; i++) {
        tNameInps[i].value = "";        
    }

    for (let i = 0; i < maxPlayers; i++) {

        //clear player texts
        players[i].setName("");
        changeInputWidth(players[i].nameInp);
        
        // clear player info
        players[i].pronouns = "";
        players[i].tag = "";
        players[i].twitter = "";
        players[i].twitch = "";
        players[i].yt = "";

        //reset characters to random
        charChange("Random", i);

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
        if (players[0].tag) {
            copiedText += players[0].tag + " | ";
        }
        copiedText += players[0].getName() + " (" + players[0].char +") VS ";
        if (players[1].tag) {
            copiedText += players[1].tag + " | ";
        }
        copiedText += players[1].getName() + " (" +  players[1].char +")";
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
    guiSettings.scoreAutoUpdate = scoreAutoUpdateCheck.checked;
    guiSettings.invertScore = invertScoreCheck.checked;
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
        if (workshopCheck.checked) {
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
        fs.writeFileSync(textPath + "/Simple Texts/Player "+(i+1)+".txt", players[i].getName());        
    }

    fs.writeFileSync(textPath + "/Simple Texts/Team 1.txt", tNameInps[0].value);
    fs.writeFileSync(textPath + "/Simple Texts/Team 2.txt", tNameInps[1].value);

    fs.writeFileSync(textPath + "/Simple Texts/Score L.txt", scores[0].getScore().toString());
    fs.writeFileSync(textPath + "/Simple Texts/Score R.txt", scores[1].getScore().toString());

    fs.writeFileSync(textPath + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(textPath + "/Simple Texts/Tournament Name.txt", tournamentInp.value);

    for (let i = 0; i < casters.length; i++) {
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Name.txt", casters[i].getName());
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Twitter.txt", casters[i].getTwitter());
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Twitch.txt", casters[i].getTwitch());
        fs.writeFileSync(textPath + "/Simple Texts/Caster "+(i+1)+" Youtube.txt", casters[i].getYt());
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
        players[i].getName() = newJson.player[i].name;
        players[i].pronouns = newJson.player[i].pronouns;
        players[i].tag = newJson.player[i].tag;
        players[i].twitter = newJson.player[i].twitter;
        players[i].twitch = newJson.player[i].twitch;
        players[i].yt = newJson.player[i].yt;

        // player character and skin
        charChange(newJson.player[i].char, i, true);
        players[i].skinChange({name: newJson.player[i].skin});

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
    writeScoreboard();
    displayNotif("GUI was remotely updated");

});
