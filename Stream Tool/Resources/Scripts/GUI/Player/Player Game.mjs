import { Player } from "./Player.mjs";
import { fileExists } from "../File System.mjs";
import { getRecolorImage, getTrailImage } from "../GetImage.mjs";
import { updateBgCharImg } from "./BG Char Image.mjs";
import { currentColors } from "../Colors.mjs";
import { settings } from "../Settings.mjs";
import { playerInfo } from "./Player Info.mjs";
import { stPath } from "../Globals.mjs";

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
        this.skinSel.innerHTML = skin.name;

        // update all images!
        this.setIconImg();
        await this.setScImg();
        await this.setVsImg();
        await this.setVsBg();

        // change the background character image (if first 2 players)
        if (this.pNum-1 < 2) {
            if (this.char == "Random" && this.pNum == 1) {
                updateBgCharImg(this.pNum-1, `${stPath.charRandom}/P2.png`);
            } else {
                updateBgCharImg(this.pNum-1, this.scSrc);
            }
        }

        // set up a trail for the vs screen
        await this.setTrailImage();

        // notify the user that we done here
        this.setReady(true);

    }

    /** Sets the Scoreboard image depening on recolors */
    async setScImg() {
        this.scSrc = await getRecolorImage(
            this.char,
            this.skin,
            this.charInfo.ogColor,
            this.charInfo.colorRange,
            "Skins",
            this.randomImg
        );
        this.scBrowserSrc = await this.getBrowserSrc(
            this.char, this.skin, "Skins", this.randomImg
        );
    }

    /** Sets the VS Screen image depending on recolors and settings */
    async setVsImg() {
        if (settings.isHDChecked()) {
            const skinName = this.skin.name.includes("LoA") && !settings.isNoLoAChecked() ? "LoA HD" : "HD";
            this.vsSrc = await getRecolorImage(this.char, {name: skinName}, "Skins", this.randomImg);
            this.vsBrowserSrc = await this.getBrowserSrc(this.char, {name: skinName}, "Skins/", this.randomImg);
            this.vsSkin = {name: skinName};
        } else { // if no HD, just use the scoreboard image
            this.vsSrc = this.scSrc;
            this.vsBrowserSrc = this.scBrowserSrc;
            this.vsSkin = this.skin;
        }
    }

    /** Sets the player's VS Screen background video src */
    async setVsBg() {

        let vsBG = `${this.char}/BG.webm`;
        let trueBGPath = stPath.char;

        if (this.skin.name.includes("LoA") && !settings.isNoLoAChecked()) {
            // show LoA background if the skin is LoA
            vsBG = 'BG LoA.webm';
            trueBGPath = stPath.charBase;;
        } else if (this.skin.name == "Ragnir") {
            // Ragnir shows the default stage in the actual game
            vsBG = 'BG.webm';
            trueBGPath = stPath.charBase;
        } else if (this.skin.name == "Shovel Knight" && this.skin.name == "Golden") {
             // why not
            vsBG = `${charName}/BG Golden.webm`;
        } else if (this.charInfo.vsScreen) { // safety check
            if (this.charInfo.vsScreen.background) { // if the character has a specific BG
                vsBG = `${this.charInfo.vsScreen.background}/BG.webm`;
            }
        }

        // if it doesnt exist, use a default BG
        if (!await fileExists(`${trueBGPath}/${vsBG}`)) {
            this.vsBgSrc = "Resources/Characters/BG.webm";
        } else {
            this.vsBgSrc = `${trueBGPath}/${vsBG}`;
        }

    }

    /** Generates a new trail image for this player */
    async setTrailImage() {
        const color = currentColors[(this.pNum-1)%2].hex.substring(1);
        this.trailSrc = await getTrailImage(this.char, this.vsSkin.name, color);
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