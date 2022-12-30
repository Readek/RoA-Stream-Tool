import { Player } from "./Player.mjs";
import { getJson } from "../Utils.mjs";
import * as glob from '../Globals.mjs';
import { getRecolorImage, getTrailImage } from "../GetImage.mjs";
import { updateBgCharImg } from "./BG Char Image.mjs";
import { currentColors } from "../Colors.mjs";
import { settings } from "../Settings.mjs";

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


    constructor(id) {
        
        super(id);
        this.nameInp = document.getElementById(`p${id}Name`);
        this.charSel = document.getElementById(`p${id}CharSelector`);
        this.skinSel = document.getElementById(`p${id}SkinSelector`);

        this.setFinderListeners();

        this.randomImg = (this.pNum-1)%2 ? "P2" : "P1";

        // resize the container if it overflows
        this.nameInp.addEventListener("input", () => {this.resizeInput()});

        // also set an initial character value
        this.charChange("Random");

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
     * Updates the character for this player
     * @param {String} character - Name of the character to update to
     * @param {Boolean} notDefault - Determines if we skinChange to the default skin
     */
    async charChange(character, notDefault) {

        this.char = character;

        // update character selector text
        this.charSel.children[1].innerHTML = character;

        // set the skin list for this character
        this.charInfo = getJson(`${glob.path.char}/${character}/_Info`);

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

    /**
     * Updates the skin for this player
     * @param {Object} skin - Skin data
     */
    async skinChange(skin) {

        // remove focus from the skin list so it auto hides
        document.activeElement.blur();

        this.skin = skin;
        this.vsSkin = skin;

        // update the text of the skin selector
        this.skinSel.innerHTML = skin.name;

        // check if an icon for this skin exists, recolor if not
        this.iconSrc = await getRecolorImage(
            this.char,
            skin,
            this.charInfo.ogColor,
            this.charInfo.colorRange,
            "Icons",
            "Icon"
        );
        this.charSel.children[0].src = this.iconSrc;

        // get us that scoreboard image
        this.scSrc = await getRecolorImage(
            this.char,
            skin,
            this.charInfo.ogColor,
            this.charInfo.colorRange,
            "Skins",
            this.randomImg
        );
        this.scBrowserSrc = this.getBrowserSrc(this.char, skin, "Skins", this.randomImg);

        // if we want HD skins, get us those for the VS screen
        if (settings.isHDChecked()) {
            const skinName = skin.name.includes("LoA") && !settings.isNoLoAChecked() ? "LoA HD" : "HD";
            this.vsSrc = await getRecolorImage(this.char, {name: skinName}, "Skins", this.randomImg);
            this.vsBrowserSrc = this.getBrowserSrc(this.char, {name: skinName}, "Skins/", this.randomImg);
            this.vsSkin = {name: skinName};
        } else {
            this.vsSrc = this.scSrc;
            this.vsBrowserSrc = this.scBrowserSrc;
            this.vsSkin = skin;
        }

        // change the background character image (if first 2 players)
        if (this.pNum-1 < 2) {

            updateBgCharImg(this.pNum-1, this.scSrc)
            if (this.char == "Random" && this.pNum == 1) {
                updateBgCharImg(this.pNum-1, `${glob.path.charRandom}/P2.png`);
            }
        }

        // set up a trail for the vs screen
        this.setTrailImage();

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