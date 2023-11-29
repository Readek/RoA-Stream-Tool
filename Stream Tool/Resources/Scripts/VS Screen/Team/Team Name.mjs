import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "../VsGlobals.mjs";

const teamSize = 72;

export class TeamName {

    #name = "";
    #nameEl;

    /**
     * Manages the team's name
     * @param {HTMLElement} nameEl - Team text element
     */
    constructor(nameEl) {

        this.#nameEl = nameEl;

    }

    /**
     * Updates the team name, fading out and in
     * @param {String} name - New team name
     */
    async update(name) {

        if (name != this.#name) {

            this.#name = name;
            
            // set some delay time to sync with everything else if needed
            const delay = current.startup ? introDelayVs+.2 : 0;

            // fade the text out (unless we're loading)
            if (!current.startup) {
                await fadeOut(this.#nameEl, fadeOutTimeVs);
            }

            // update that text while nobody is seeing it!
            updateText(this.#nameEl, name, teamSize);
            resizeText(this.#nameEl);

            // and fade it back to normal
            fadeIn(this.#nameEl, fadeInTimeVs, delay);

        }

    }

    /** Hides the text element */
    hide() {
        this.#nameEl.style.display = "none";
    }

    /** Displays the text wrapper, fading it in */
    show() {
        fadeIn(this.#nameEl, fadeInTimeVs, introDelayVs + .2);
        this.#nameEl.style.display = "flex";
    }

}