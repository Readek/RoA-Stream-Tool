import { Finder } from "./Finder.mjs";
import { getPresetList } from '../File System.mjs';
import { current } from "../Globals.mjs";


class CommFinder extends Finder {

    #commPresets;

    constructor() {
        super(document.getElementById("casterFinder"));
        this.setCasterPresets();
    }


    /** Sets a new player preset list from the presets folder */
    async setCasterPresets() {
        this.#commPresets = await getPresetList("Commentator Info");
    }

    /**
     * Fills the caster preset finder depending on current commentator name
     * @param {Caster} caster - Commentator to find presets for
     */
    async fillFinderPresets(caster) {

        // get rid of the previous list
        this._clearList();

        // to keep track if we found any presets
        let fileFound;

        // only activate if we get at least 3 characters
        if (caster.getName().length >= 3) {

            for (let i = 0; i < this.#commPresets.length; i++) {
                
                const preset = this.#commPresets[i]; // to simplify code
                
                // if it matches with the current input text
                if (preset.name.toLocaleLowerCase().includes(caster.getName().toLocaleLowerCase())) {

                    // store that we found at least one preset
                    fileFound = true;

                    // create the new div that will be added as an entry
                    const newDiv = document.createElement('button');
                    newDiv.className = "finderEntry";

                    // entry text
                    const spanName = document.createElement('span');
                    spanName.innerHTML = preset.name;
                    spanName.className = "pfName";

                    newDiv.appendChild(spanName);

                    // data to be accessed when clicked
                    const cData = {
                        name : preset.name,
                        twitter : preset.twitter,
                        twitch : preset.twitch,
                        yt : preset.yt
                    }

                    // when the div is clicked, update caster
                    newDiv.addEventListener("click", () => {this.#entryClick(cData, caster)});

                    this.addEntry(newDiv);

                }
            }

        }

        // if we got some presets, show up finder
        if (fileFound) {
            this._finderEl.style.display = "block";
        } else {
            this._finderEl.style.display = "none";
        }

    }

    /**
     * Updates a caster with the data stored on the list's entry
     * @param {Object} cData - Data to be added to the caster
     * @param {Caster} caster - Commentator to be updated
     */
    #entryClick(cData, caster) {

        // reset current focus
        current.focus = -1;

        caster.setName(cData.name);
        caster.setTwitter(cData.twitter);
        caster.setTwitch(cData.twitch);
        caster.setYt(cData.yt);

        this.hide();

    }

}

export const commFinder = new CommFinder;