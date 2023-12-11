import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";

export class PlayerInfo {

    #pronouns = "";

    #pronsEl;

    /**
     * Controls the player's pronouns and socials
     * @param {HTMLElement} infoEl - Element with all player info
     */
    constructor(infoEl) {

        this.#pronsEl = infoEl;

    }

    getPronouns() {
        return this.#pronouns;
    }

    /**
     * Updates the displayed player pronouns
     * @param {String} pronouns - The player's pronouns
     */
    async update(pronouns) {

        this.#pronouns = pronouns;

        // if not loading up
        if (!current.startup) {

            // wait for the top bar animation to proceed
            // todo call for Team top bar
            /* await fadeOut(this.#pronsEl, fadeOutTimeVs); */

        }

        // update that data
        this.#pronsEl.innerHTML = pronouns;

        // call that top bar to come back up (if pronouns exist)
        if (pronouns) {
            // todo call for Team top bar
        }

    }

}