import { current } from "../../Utils/Globals.mjs";
import { teams } from "../Team/Teams.mjs";

export class PlayerInfo {

    #pronouns = "";
    #pNum;

    #pronsEl;

    /**
     * Controls the player's pronouns and socials
     * @param {HTMLElement} infoEl - Element with all player info
     * @param {Number} id - Team number
     */
    constructor(infoEl, id) {

        this.#pronsEl = infoEl;

        this.#pNum = id;

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

        // delay so we sync timing with everything else
        let delay = current.delay + .6;

        // if not loading up
        if (!current.startup) {

            // but not if we arent loading everything up!
            delay = 0;

            // wait for the top bar animation to proceed
            await teams.team((this.#pNum - 1) % 2).topBar().hide();

        }

        // update that data
        this.#pronsEl.innerHTML = pronouns;

        // hide the element entirely if no pronouns
        if (pronouns) {
            this.#pronsEl.style.display = "block";
        } else {
            this.#pronsEl.style.display = "none";
            
        }

        // call that top bar to come back up
        teams.team((this.#pNum - 1) % 2).topBar().show(delay);

    }

}