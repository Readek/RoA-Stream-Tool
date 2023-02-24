import { getCharacterList, getJson } from '../File System.mjs';
import { getRecolorImage } from '../GetImage.mjs';
import { FinderSelect } from './Finder Select.mjs';
import { stPath } from '../Globals.mjs';

class CharFinder extends FinderSelect {

    #charList;
    #curPlayer;

    constructor() {
        super(document.getElementById("characterFinder"));
    }

    /** Fills the character list with each folder on the Characters folder */
    async loadCharacters() {

        // first of all, clear a possible already existing list
        this._finderEl.lastElementChild.innerHTML = "";

        // create a list with folder names on charPath
        this.#charList = await getCharacterList();

        // add entries to the character list
        for (let i = 0; i < this.#charList.length; i++) {

            // get us the charInfo for this character
            const charInfo = await getJson(`${stPath.char}/${this.#charList[i]}/_Info`);

            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {this.#entryClick(this.#charList[i])});

            // character icon
            const imgIcon = document.createElement('img');
            imgIcon.className = "fIconImg";
            // check if the character exists
            let skin = { name: "Default" }, colorData;
            if (charInfo) {
                skin = charInfo.skinList[0];
                colorData = charInfo.colorData;
            }
            // this will get us the true default icon for any character
            imgIcon.src = await getRecolorImage(
                false,
                this.#charList[i],
                skin,
                colorData,
                "Icons",
                "Icon"
            )

            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = this.#charList[i];
            spanName.className = "pfName";

            //add them to the div we created before
            newDiv.appendChild(imgIcon);
            newDiv.appendChild(spanName);

            //and now add the div to the actual interface
            this.addEntry(newDiv);

        }

    }
    getCharList() {
        return this.#charList;
    }

    #entryClick(charName) {

        // clear focus to hide character select menu
        document.activeElement.blur();

        // clear filter box
        this._finderEl.firstElementChild.value = "";

        // our player class will take things from here
        this.#curPlayer.charChange(charName);

    }

    setCurrentPlayer(player) {
        this.#curPlayer = player;
    }

}

export const charFinder = new CharFinder;