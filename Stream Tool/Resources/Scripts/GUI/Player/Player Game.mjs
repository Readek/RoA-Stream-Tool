import { Player } from "./Player.mjs";
import { fileExists } from "../File System.mjs";
import { getRecolorImage, getTrailImage } from "../GetImage.mjs";
import { updateBgCharImg } from "./BG Char Image.mjs";
import { currentColors } from "../Colors.mjs";
import { settings } from "../Settings.mjs";
import { playerInfo } from "./Player Info.mjs";
import { stPath } from "../Globals.mjs";
import { gamemode } from "../Gamemode Change.mjs";

export class PlayerGame extends Player {

    tag = "";
    pronouns = "";
    twitter = "";
    twitch = "";
    yt = "";

    vsSkin;
    scSrc;
    scBrowserSrc;
    vsSrc;
    vsBrowserSrc;
    vsBgSrc;

    pInfoDiv;
    cInfoDiv;

    constructor(id, pInfoEl, cInfoEl) {
        
        super(id);
        this.nameInp = pInfoEl.getElementsByClassName("nameInput")[0];
        this.charSel = cInfoEl.getElementsByClassName("charSelector")[0];
        this.skinSel = cInfoEl.getElementsByClassName("skinSelector")[0];

        this.setFinderListeners();

        this.randomImg = (this.pNum-1)%2 ? "P2" : "P1";

        // resize the container if it overflows
        this.nameInp.addEventListener("input", () => {this.resizeInput()});

        // open player info menu if clicking on the icon
        pInfoEl.getElementsByClassName("pInfoButt")[0].addEventListener("click", () => {
            playerInfo.show(this);
        });

        this.pInfoDiv = pInfoEl;
        this.cInfoDiv = cInfoEl;

    }


    getName() {
        return this.nameInp.value;
    }
    setName(name) {
        this.nameInp.value = name;
        this.resizeInput();
    }
    getTag() {
        return this.tag;
    }
    setTag(tag) {
        this.tag = tag;
    }


    /**
     * Updates the skin for this player
     * @param {Object} skin - Skin data
     */
    async skinChange(skin) {

        this.setReady(false);

        // remove focus from the skin list so it auto hides
        document.activeElement.blur();

        this.skin = skin;
        this.vsSkin = skin;

        // update the text of the skin selector
        if (skin.customImg) {
            this.skinSel.innerHTML = "Custom " + skin.name;
        } else {
            this.skinSel.innerHTML = skin.name;
        }

        // store custom skin data
        this.skinHex = skin.hex;
        this.customImg = skin.customImg;

        // update all images!
        await this.setIconImg();
        await this.setScImg();
        // this depends on sc image
        await this.setVsImg();
        // update the VS BG based on the vs img
        await this.setVsBg();
        // set up a trail for the vs screen
        await this.setTrailImage();


        // change the background character image (if first 2 players)
        if (this.pNum-1 < 2) {
            if (this.char == "Random" && this.pNum == 1) {
                updateBgCharImg(this.pNum-1, `${stPath.charRandom}/P2.png`);
            } else {
                updateBgCharImg(this.pNum-1, this.scSrc);
            }
        }
        // notify the user that we done here
        this.setReady(true);

    }

    /** Sets the Scoreboard image depening on recolors */
    async setScImg() {

        const promises = [];

        // determine which folder is going to be used
        let folder;
        if (settings.isAltArtChecked() && this.charInfo.scoreboard.alt) {
            folder = "AltArt";
        } else {
            folder = "Skins";
        }

        // get us a valid image
        promises.push(getRecolorImage(
            this.shader,
            this.char,
            this.skin,
            this.charInfo.colorData,
            folder,
            this.randomImg
        ));
        promises.push(this.getBrowserSrc(
            this.char, this.skin, folder, this.randomImg
        ));

        // when those finish loading, set the image values
        await Promise.all(promises).then( (value) => {
            this.scSrc = value[0];
            this.scBrowserSrc = value[1];
        });

    }

    /** Sets the VS Screen image depending on recolors and settings */
    async setVsImg() {
        if (settings.isHDChecked()) {
            const promises = [];
            const skinName = this.skin.name.includes("LoA") && !settings.isNoLoAChecked() ? "LoA HD" : "HD";
            promises.push(getRecolorImage(this.shader, this.char, {name: skinName}, null, "Skins", this.randomImg));
            promises.push(this.getBrowserSrc(this.char, {name: skinName}, "Skins/", this.randomImg));
            this.vsSkin = {name: skinName};
            await Promise.all(promises).then( (value) => {
                this.vsSrc = value[0];
                this.vsBrowserSrc = value[1];
            })
        } else { // if no HD, just use the scoreboard image
            if (settings.isAltArtChecked() && this.charInfo.scoreboard.alt) {
                // if the character is using alt art, we need to generate a new image
                const promises = [];
                promises.push(getRecolorImage(
                    this.shader,
                    this.char,
                    this.skin,
                    this.charInfo.colorData,
                    "Skins",
                    this.randomImg
                ));
                promises.push(this.getBrowserSrc(
                    this.char, this.skin, "Skins", this.randomImg
                ));

                // when those finish loading, set the image values
                await Promise.all(promises).then( (value) => {
                    this.vsSrc = value[0];
                    this.vsBrowserSrc = value[1];
                });
            } else {
                // by default, use the scoreboard image
                this.vsSrc = this.scSrc;
                this.vsBrowserSrc = this.scBrowserSrc;
            }
            this.vsSkin = this.skin;            
        }
    }

    /** Sets the player's VS Screen background video src */
    async setVsBg() {

        let vsBG = `${this.char}/BG.webm`;
        let trueBGPath = stPath.char;

        if (this.vsSkin.name.includes("LoA") && !settings.isNoLoAChecked()) {
            // show LoA background if the skin is LoA
            vsBG = 'BG LoA.webm';
            trueBGPath = stPath.charBase;;
        } else if (this.vsSkin.name == "Ragnir") {
            // Ragnir shows the default stage in the actual game
            vsBG = 'BG.webm';
            trueBGPath = stPath.charBase;
        } else if (this.char == "Shovel Knight" && this.vsSkin.name == "Golden") {
             // why not
            vsBG = `${this.char}/BG Golden.webm`;
        } else if (this.charInfo.vsScreen) { // safety check
            if (this.charInfo.vsScreen.background) { // if the character has a specific BG
                vsBG = `${this.charInfo.vsScreen.background}/BG.webm`;
            }
        }

        // if it doesnt exist, use a default BG
        if (!await fileExists(`${trueBGPath}/${vsBG}`)) {
            this.vsBgSrc = "Resources/Characters/BG.webm";
        } else {
            if (settings.isWsChecked()) {
                this.vsBgSrc = `Resources/Characters/_Workshop/${vsBG}`;
            } else {
                this.vsBgSrc = `Resources/Characters/${vsBG}`;
            }
        }

    }

    /** Generates a new trail image for this player */
    async setTrailImage() {
        const color = currentColors[(this.pNum-1)%2].hex.substring(1);
        this.trailSrc = await getTrailImage(this.shader, this.char, this.vsSkin.name, color);
    }

    /**
     * Returns character image position data for the scoreboard
     * @returns Array of scoreboard position data
     */
    getScCharPos() {
        const scCharPos = [];
        const charPos = this.charInfo;
        if (charPos.scoreboard.neutral) {
            if (charPos.scoreboard[this.skin.name]) {
                // if the skin has a specific position
                scCharPos[0] = charPos.scoreboard[this.skin.name].x;
                scCharPos[1] = charPos.scoreboard[this.skin.name].y;
                scCharPos[2] = charPos.scoreboard[this.skin.name].scale;
            } else if (settings.isAltArtChecked() && charPos.scoreboard.alt) {
                // for workshop alternative art
                scCharPos[0] = charPos.scoreboard.alt.x;
                scCharPos[1] = charPos.scoreboard.alt.y;
                scCharPos[2] = charPos.scoreboard.alt.scale;
            } else { // if none of the above, use a default position
                scCharPos[0] = charPos.scoreboard.neutral.x;
                scCharPos[1] = charPos.scoreboard.neutral.y;
                scCharPos[2] = charPos.scoreboard.neutral.scale;
            }
        } else { // if there are no character positions, set positions for "Random"
            if (this.pNum % 2 == 0) {
                scCharPos[0] = 30;
            } else {
                scCharPos[0] = 35;
            }
            scCharPos[1] = -10;
            scCharPos[2] = 1.2;
        }
        return scCharPos;
    }
    /**
     * Returns character image position data for the scoreboard
     * @returns Array of scoreboard position data
     */
    getVsCharPos() {
        const vsCharPos = [];
        const charPos = this.charInfo;
        // get the character positions
        if (charPos.vsScreen) {
            if (charPos.vsScreen[this.vsSkin.name]) { // if the skin has a specific position
                vsCharPos[0] = charPos.vsScreen[this.vsSkin.name].x;
                vsCharPos[1] = charPos.vsScreen[this.vsSkin.name].y;
                vsCharPos[2] = charPos.vsScreen[this.vsSkin.name].scale;
            } else { //if not, use a default position
                vsCharPos[0] = charPos.vsScreen.neutral.x;
                vsCharPos[1] = charPos.vsScreen.neutral.y;
                vsCharPos[2] = charPos.vsScreen.neutral.scale;
            }
        } else { // if there are no character positions, set positions for "Random"
            if (this.pNum % 2 == 0) {
                vsCharPos[0] = -500;
            } else {
                vsCharPos[0] = -475;
            }
            //if doubles, we need to move it up a bit
            if (gamemode.getGm() == 2) {
                vsCharPos[1] = -125;
            } else {
                vsCharPos[1] = 0;
            }
            vsCharPos[2] = .8;
        }
        return vsCharPos;
    }

    /** Changes the width of an input box depending on the text */
    resizeInput() {
        this.nameInp.style.width = this.getTextWidth(this.nameInp.value,
            window.getComputedStyle(this.nameInp).fontSize + " " +
            window.getComputedStyle(this.nameInp).fontFamily
            ) + 12 + "px";
    }

    /** Used to get the exact width of a text considering the font used */
    getTextWidth(text, font) {
        const canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

}