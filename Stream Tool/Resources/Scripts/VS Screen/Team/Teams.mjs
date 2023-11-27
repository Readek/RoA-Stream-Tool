import { maxSides } from "../../Utils/Globals.mjs";
import { Team } from "./Team.mjs";

class Teams {

    /** @type {Team[]} */
    #teams = [];

    constructor() {

        // gather the data needed for our classes
        const nameEls = document.getElementsByClassName("teamName");

        // for both sides, create them teams
        for (let i = 0; i < maxSides; i++) {
            this.#teams.push(new Team(nameEls[i]));
        }

    }

    /**
     * Updates team data (names, colors and scores)
     * @param {Array} name - Current team names
     * @param {Array} color - Current team colors
     * @param {Array} score - Current team scores
     */
    update(name, color, score) {
        for (let i = 0; i < this.#teams.length; i++) {
            this.#teams[i].update(name[i], color[i], score);
        }
    }

}

export const teams = new Teams;