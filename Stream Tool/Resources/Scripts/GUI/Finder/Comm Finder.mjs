import { Finder } from "./Finder.mjs";
import * as glob from '../Globals.mjs';
import { getJson } from '../Utils.mjs';
const fs = require('fs');


class CommFinder extends Finder {

    constructor() {
        super(document.getElementById("casterFinder"))
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

                // get the preset name
                file = file.substring(0, file.length - 5);

                // if it matches with the current input text
                if (file.toLocaleLowerCase().includes(caster.getName().toLocaleLowerCase())) {

                    fileFound = true;

                    // get the preset data
                    const casterInfo = getJson(`${glob.path.text}/Commentator Info/${file}`);

                    // create the new div that will be added as an entry
                    const newDiv = document.createElement('button');
                    newDiv.className = "finderEntry";
                    newDiv.addEventListener("click", () => {this.casterPreset(newDiv, caster)});

                    // entry text
                    const spanName = document.createElement('span');
                    spanName.innerHTML = file;
                    spanName.className = "pfName";

                    // data to be accessed when clicked
                    newDiv.setAttribute("twitter", casterInfo.twitter);
                    newDiv.setAttribute("twitch", casterInfo.twitch);
                    newDiv.setAttribute("yt", casterInfo.yt);
                    newDiv.setAttribute("name", file);

                    newDiv.appendChild(spanName);

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

    //called when the user clicks on a player preset
    casterPreset(clickDiv, caster) {

        caster.setName(clickDiv.getAttribute("name"));
        caster.setTwitter(clickDiv.getAttribute("twitter"));
        caster.setTwitch(clickDiv.getAttribute("twitch"));
        caster.setYt(clickDiv.getAttribute("yt"));

        commFinder.hide();

    }

}

export const commFinder = new CommFinder;