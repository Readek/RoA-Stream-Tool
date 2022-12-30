import { charFinder } from "../Finder/Char Finder.mjs";
import { playerFinder } from "../Finder/Player Finder.mjs";
import { skinFinder } from "../Finder/Skin Finder.mjs";
import * as glob from '../Globals.mjs';
import { settings } from "../Settings.mjs";
const fs = require('fs');


export class Player {

    nameInp;
    tagInp;
    charSel;
    skinSel;

    char = "";
    skin = "";
    charInfo;
    iconSrc;

    constructor(id) {

        this.pNum = id;

    }

    /** Sets up listeners for all finders */
    setFinderListeners() {

        // check if theres a player preset every time we type or click in the player box
        this.nameInp.addEventListener("input", () => {
            playerFinder.fillFinderPresets(this);
        });
        this.nameInp.addEventListener("focusin", () => {
            playerFinder.fillFinderPresets(this);
            playerFinder.open(this.nameInp.parentElement);
        });

        // hide the player presets menu if text input loses focus
        this.nameInp.addEventListener("focusout", () => {
            if (!glob.inside.finder) { //but not if the mouse is hovering a finder
                playerFinder.hide();
            }
        });

        // set listeners that will trigger when character or skin changes
        this.charSel.addEventListener("click", () => {
            charFinder.open(this.charSel, this.pNum-1);
            charFinder.setCurrentPlayer(this);
            charFinder.focusFilter();
        });
        this.skinSel.addEventListener("click", () => {
            skinFinder.open(this.skinSel, this.pNum-1);
            skinFinder.fillSkinList(this);
            skinFinder.focusFilter();
        });

    }

    /** Returns a valid src for browser sources */
    getBrowserSrc(char, skin, extraPath, failPath) {

        let browserCharPath = "Resources/Characters";
        if (settings.isWsChecked()) {
            browserCharPath = "Resources/Characters/_Workshop";
        }
        
        if (fs.existsSync(`${glob.path.char}/${char}/${extraPath}/${skin.name}.png`) && !skin.force) {
            return browserCharPath + `/${char}/${extraPath}/${skin.name}.png`;
        } else if (fs.existsSync(`${glob.path.char}/${char}/${extraPath}/Default.png`)) {
            if (skin.hex) {
                return null;
            } else {
                return browserCharPath + `/${char}/${extraPath}/Default.png`;
            }
        } else {
            return `Resources/Characters/Random/${failPath}.png`;;
        }
        
    }

}