import { fadeIn, fadeInMove } from "../../Utils/Fade In.mjs";
import { fadeOutMove } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { gamemode } from "../Gamemode Change.mjs";

const teamSize = 22;

export class TeamName {

    #name = "";
    #side;

    #nameEl;

    /**
     * Manages the team's name
     * @param {HTMLElement} nameEl - Team text element
     * @param {String} side - L for left, R for right
     */
    constructor(nameEl, side) {

        this.#nameEl = nameEl;

        // to know animation direction
        this.#side = side == "L" ? true : false;

    }

    /**
     * Updates the team name, fading out and in
     * @param {String} name - New team name
     */
    async update(name) {

        if (name != this.#name && gamemode.getGm() == 2) {

            this.#name = name;
            
            // set some delay time to sync with everything else if needed
            let delay = current.delay;

            // fade the text out (unless we're loading)
            if (!current.startup) {
                delay = 0;
                await fadeOutMove(this.#nameEl, false, this.#side);
            }

            // update that text while nobody is seeing it!
            updateText(this.#nameEl, name, teamSize);
            resizeText(this.#nameEl);

            // and fade it back to normal
            fadeInMove(this.#nameEl, false, this.#side, delay);

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