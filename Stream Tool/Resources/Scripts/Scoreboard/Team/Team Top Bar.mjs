import { current } from "../../Utils/Globals.mjs";
import { bestOf } from "../BestOf.mjs";

export class TeamTopBar {

    #wl;

    #topBarEl;
    #wlEl

    /**
     * Manages the team's top bar where pronouns and W/L are displayed
     * @param {HTMLElement} topBarEl - Team top bar element
     */
    constructor(topBarEl) {

        this.#topBarEl = topBarEl;
        this.#wlEl = topBarEl.getElementsByClassName("wlText")[0];

    }

    async update(wl) {

        if (this.#wl != wl) {
            
            // remember remember
            this.#wl = wl;

            // delay so we sync timing with everything else
            let delay = current.delay + .6;

            if (!current.startup) {

                // but not if we arent loading everything up!
                delay = 0;

                // wait for the hide to happen
                await this.hide();

            }

            // check if winning or losing in a GF, then change the text
            if (wl == "W") {
                this.#wlEl.innerHTML = "WINNERS";
                this.#wlEl.style.color = "#76a276";
            } else if (wl == "L") {
                this.#wlEl.innerHTML = "LOSERS";
                this.#wlEl.style.color = "#a27677";
            } else {
                this.#wlEl.innerHTML = "";
            }

            // hide the element entirely if we got nothing
            if (wl) {
                this.#wlEl.style.display = "block";
            } else {
                this.#wlEl.style.display = "none";
            }

            // and move the bar back up, if we got something to show that is
            this.show(delay);

        }

    }

    /**
     * Updates elements to desired Best Of mode
     * @param {*} bo - Current Best Of type
     * @param {Number} gm - Current gamemode
     */
    updateBo(bo, gm) {

        // moves top bar to compensate for new border image width
        if (bo == "X" && gm == 1) {
            this.#topBarEl.parentElement.parentElement.classList.add("topBarSinglesNum");
        } else {
            this.#topBarEl.parentElement.parentElement.classList.remove("topBarSinglesNum");
        }

    }

    /**
     * Moves the top bar depending on the gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        if (gamemode == 2) { // doubles
            
            this.#topBarEl.parentElement.parentElement.classList.add("topBarDoubles");

        } else { // singles
            
            this.#topBarEl.parentElement.parentElement.classList.remove("topBarDoubles");

        }

        this.updateBo(bestOf.getBo(), gamemode);
            
    }

    /** Moves the top bar down, hiding it */
    async hide() {
        this.#topBarEl.style.animation = `wlMoveOut .4s both`;
	    await new Promise(resolve => setTimeout(resolve, .4 * 1000));
    }

    /**
     * Moves the top bar up, checking if theres actually something to show
     * @param {Number} delay - Time in seconds to wait until movement happens
     */
    show(delay) {
        if (this.#checkTopBar()) {
            this.#topBarEl.style.animation = `wlMoveIn .4s ${delay}s both`;
        }
    }

    /**
     * Checks if the top bar has text to show
     * @returns {Boolean}
     */
    #checkTopBar() {
        for (let i = 0; i < this.#topBarEl.childElementCount; i++) {
            if (this.#topBarEl.children[i].innerHTML) {
                return true;
            }
        }
    }

}