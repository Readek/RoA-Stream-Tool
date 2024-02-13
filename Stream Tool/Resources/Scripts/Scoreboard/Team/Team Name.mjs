import { fadeInMove } from "../../Utils/Fade In.mjs";
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
    #nameBg;

    /**
     * Manages the team's name
     * @param {HTMLElement} nameEl - Team text element
     * @param {String} side - L for left, R for right
     */
    constructor(nameEl, nameBg, side) {

        this.#nameEl = nameEl;
        this.#nameBg = nameBg;

        // to know animation direction
        this.#side = side == "L" ? true : false;

    }

    getName() {
        return this.#name;
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

    /**
     * Updates the name background depending on the gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {
        this.#nameBg.src = `Resources/Overlay/Scoreboard/Name BG ${gamemode}.png`;
    }

    /** Displays the text wrapper, fading it in */
    show() {
        if (gamemode.getGm() == 2) {
            fadeInMove(this.#nameEl, null, this.#side, current.delay);
        }
    }

}