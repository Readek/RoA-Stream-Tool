import { Finder } from "./Finder.mjs";
import * as glob from '../Globals.mjs';
import { getJson } from '../Utils.mjs';
const fs = require('fs');


class CommFinder extends Finder {

    constructor() {
        super(document.getElementById("casterFinder"));
    }

    fillFinderPresets(caster) {

        // get rid of the previous list
        this._clearList();

        // to keep track if we found any presets
        let fileFound;

        // only activate if we get at least 3 characters
        if (caster.getName().length >= 3) {

            // get us the preset files, then for each one:
            const files = fs.readdirSync(glob.path.text + "/Commentator Info/");
            files.forEach(file => {

                // removes ".json" from the file name
                file = file.substring(0, file.length - 5);

                // if it matches with the current input text
                if (file.toLocaleLowerCase().includes(caster.getName().toLocaleLowerCase())) {

                    // store that we found at least one preset
                    fileFound = true;

                    // get the preset data
                    const casterInfo = getJson(`${glob.path.text}/Commentator Info/${file}`);

                    // create the new div that will be added as an entry
                    const newDiv = document.createElement('button');
                    newDiv.className = "finderEntry";

                    // entry text
                    const spanName = document.createElement('span');
                    spanName.innerHTML = file;
                    spanName.className = "pfName";

                    newDiv.appendChild(spanName);

                    // data to be accessed when clicked
                    const cData = {
                        name : file,
                        twitter : casterInfo.twitter,
                        twitch : casterInfo.twitch,
                        yt : casterInfo.yt
                    }

                    // when the div is clicked, update caster
                    newDiv.addEventListener("click", () => {this.#entryClick(cData, caster)});

                    this.addEntry(newDiv);

                }

            });

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

        caster.setName(cData.name);
        caster.setTwitter(cData.twitter);
        caster.setTwitch(cData.twitch);
        caster.setYt(cData.yt);

        this.hide();

    }

}

export const commFinder = new CommFinder;