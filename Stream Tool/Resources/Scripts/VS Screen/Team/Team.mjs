import { TeamColor } from "./Team Color.mjs";
import { TeamName } from "./Team Name.mjs";

export class Team {

    #tName;
    #tColor;

    /**
     * Controls name, color and score info for a team
     * @param {HTMLElement} nameEl - Team name element
     * @param {Element} cssRoot - Where the css variables may be
     * @param {String} side - Side of team, L or R
     */
    constructor(nameEl, cssRoot, side) {

        this.#tName = new TeamName(nameEl);
        this.#tColor = new TeamColor(cssRoot, side)

    }

    /**
     * Updates team data (name, color and score)
     * @param {String} name - Team's name
     * @param {Object} color - Team's color
     * @param {Number} score - Team's score
     */
    update(name, color, score) {

        this.#tName.update(name);
        this.#tColor.update(color.hex);

    }

}