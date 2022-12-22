const fs = require('fs');
import * as glob from '../Globals.mjs';
import { getJson } from '../Utils.mjs';
import { getRecolorImage } from '../GetImage.mjs';
import { filterFinder } from './Filter Finder.mjs';

class CharFinder {

    #finderEl = document.getElementById("characterFinder");

    constructor() {

        // filter the finder list as we type
        this.#finderEl.addEventListener("input", () => {filterFinder(this.#finderEl)});
    
    }

    /** Fills the character list with each folder on the Characters folder */
    loadCharacters() {

        // first of all, clear a possible already existing list
        this.#finderEl.lastElementChild.innerHTML = "";

        // create a list with folder names on charPath
        const characterList = fs.readdirSync(glob.path.char, { withFileTypes: true })
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
            const charInfo = getJson(`${glob.path.char}/${characterList[i]}/_Info`);

            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {this.entryClick(characterList[i])});

            // character icon
            const imgIcon = document.createElement('img');
            imgIcon.className = "fIconImg";
            // check if the character exists
            let skin = { name: "Default" }, ogColor, colorRange;
            if (charInfo) {
                skin = charInfo.skinList[0];
                ogColor = charInfo.ogColor;
                colorRange = charInfo.colorRange;
            }
            // this will get us the true default icon for any character
            getRecolorImage(
                characterList[i],
                skin,
                ogColor,
                colorRange,
                "Icons/",
                "Icon"
            ).then((imgSrc) => {
                imgIcon.src = imgSrc;
            });

            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = characterList[i];
            spanName.className = "pfName";

            //add them to the div we created before
            newDiv.appendChild(imgIcon);
            newDiv.appendChild(spanName);

            //and now add the div to the actual interface
            this.#finderEl.lastElementChild.appendChild(newDiv);

        }

        // this is just so Remote Update has a character list
        fs.writeFileSync(`${glob.path.text}/Character List.json`, JSON.stringify(characterList, null, 2));

    }

    /** Opens the character finder below the clicked player selector */
    open(charSel, pNum) {

        // move the dropdown menu under the current char selector
        charSel.appendChild(this.#finderEl);

        // focus the search input field and reset the list
        this.#finderEl.firstElementChild.value = "";
        this.#finderEl.firstElementChild.focus();
        filterFinder(this.#finderEl);

        // set up some global variables for other functions
        glob.current.player = pNum;
        glob.current.focus = -1;

        // reset the dropdown position
        this.#finderEl.style.top = "100%";
        this.#finderEl.style.left = "0";

        // get some data to calculate if it goes offscreen
        const finderPos = this.#finderEl.getBoundingClientRect();
        const selectPos = this.#finderEl.parentElement.getBoundingClientRect();

        // vertical check
        if (selectPos.bottom + finderPos.height > window.innerHeight) {
            this.#finderEl.style.top = `calc(100% + ${window.innerHeight - finderPos.bottom - 10}px)`;
            this.#finderEl.style.left = "100%";
        }
        // horizontal check
        /* if (selectPos.right + finderPos.width > window.innerWidth) {
            this.#finderEl.style.left = `calc(100% + ${window.innerWidth + finderPos.right + 5}px)`;
        } */

    }

    entryClick(charName) {

        // clear focus to hide character select menu
        document.activeElement.blur();

        // clear filter box
        this.#finderEl.firstElementChild.value = "";

        // our player class will take things from here
        if (glob.inside.bracket) {
            bracketPlayers[glob.current.player].charChange(charName);
        } else {
            players[glob.current.player].charChange(charName);
        }

    }

    /**
     * Scans for all current entries, then returns them
     * @returns { HTMLCollectionOf}
    */
    getFinderEntries() {
        return this.#finderEl.getElementsByClassName("finderEntry");

    }

    /**
     * Checks for the current finder's display status
     * @returns {String} - Current display css value
     */
    getDisplayValue() {
        return window.getComputedStyle(this.#finderEl).getPropertyValue("display");
    }

}

export const charFinder = new CharFinder;