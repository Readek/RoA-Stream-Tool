import { TeamName } from "./Team Name.mjs";

export class Team {

    #tName;

    constructor(nameEl) {

        this.#tName = new TeamName(nameEl);

    }

    /**
     * Updates team data (name, color and score)
     * @param {String} name - Team's name
     * @param {Object} color - Team's color
     * @param {Number} score - Team's score
     */
    update(name, color, score) {

        this.#tName.update(name);

    }

}