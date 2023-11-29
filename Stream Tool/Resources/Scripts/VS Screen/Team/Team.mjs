import { TeamColor } from "./Team Color.mjs";
import { TeamName } from "./Team Name.mjs";
import { TeamScore } from "./Team Score.mjs";

export class Team {

    #tName;
    #tColor;
    #tScore;

    /**
     * Controls name, color and score info for a team
     * @param {HTMLElement} nameEl - Team name element
     * @param {Element} cssRoot - Where the css variables may be
     * @param {String} side - Side of team, L or R
     * @param {HTMLElement} scoreTicks - Team score ticks
     * @param {HTMLElement} scoreNum - Team score number
     */
    constructor(nameEl, cssRoot, side, scoreTicks, scoreNum) {

        this.#tName = new TeamName(nameEl);
        this.#tColor = new TeamColor(cssRoot, side);
        this.#tScore = new TeamScore(scoreTicks, scoreNum, side);

    }

    getScore() {
        return this.#tScore.getScore();
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
        this.#tScore.update(score);

    }

    /** Hides some stuff when browser goes out of view */
    hide() {
        this.#tName.hide();
    }

    /** Display elements and animations when user comes back to the browser */
    show() {
        this.#tName.show();
    }

}