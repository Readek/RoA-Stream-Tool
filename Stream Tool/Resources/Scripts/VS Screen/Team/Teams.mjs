import { Team } from "./Team.mjs";

class Teams {

    /** @type {Team[]} */
    #teams = [];

    constructor() {

        // gather the data needed for our classes
        const nameEls = document.getElementsByClassName("teamName");
        const cssRoot = document.querySelector(':root');

        // for both sides, create them teams
        this.#teams.push(
            new Team(nameEls[0], cssRoot, "L"),
            new Team(nameEls[1], cssRoot, "R"),
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
    }

}

export const teams = new Teams;