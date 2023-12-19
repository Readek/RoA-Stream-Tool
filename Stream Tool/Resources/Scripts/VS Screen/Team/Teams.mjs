import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "../VsGlobals.mjs";
import { Team } from "./Team.mjs";

const scoreEl = document.getElementById("scores");

class Teams {

    /** @type {Team[]} */
    #teams = [];

    constructor() {

        // gather the data needed for our classes
        const nameEls = document.getElementsByClassName("teamName");
        const cssRoot = document.querySelector(':root');
        const scoreTicksL = document.getElementById("scoresL");
        const scoreTicksR = document.getElementById("scoresR");
        const scoreNumL = document.getElementById("scoreNumL");
        const scoreNumR = document.getElementById("scoreNumR");

        // for both sides, create them teams
        this.#teams.push(
            new Team(nameEls[0], cssRoot, "L", scoreTicksL, scoreNumL),
            new Team(nameEls[1], cssRoot, "R", scoreTicksR, scoreNumR),
        );

    }

    /**
     * Updates team data (names, colors and scores)
     * @param {Array} name - Current team names
     * @param {Array} color - Current team colors
     * @param {Array} score - Current team scores
     */
    update(name, color, score) {

        for (let i = 0; i < this.#teams.length; i++) {
            this.#teams[i].update(name[i], color[i], score[i]);
        }

        // if the scores for both sides are 0, hide scores HUD
        if (this.#teams[0].getScore() == 0 && this.#teams[1].getScore() == 0) {

            // if loading, just skip the fade
            if (current.startup) {
                scoreEl.style.animation = "";
                scoreEl.style.opacity = 0;
            } else {
                fadeOut(scoreEl, fadeOutTimeVs);
            }

        } else {
            fadeIn(scoreEl, fadeInTimeVs);
        }

    }

    /** Hides some elements when browser goes out of view */
    hide() {

        for (let i = 0; i < this.#teams.length; i++) {
            this.#teams[i].hide();            
        }

    }

    /** Returns some elements back to view, animating them */
    show() {

        for (let i = 0; i < this.#teams.length; i++) {
            this.#teams[i].show();            
        }

    }

}

export const teams = new Teams;