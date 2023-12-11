import { TeamColor } from "./Team Color.mjs";
import { TeamName } from "./Team Name.mjs";
import { TeamScore } from "./Team Score.mjs";
import { TeamTopBar } from "./Team Top Bar.mjs";

export class Team {

    #tName;
    #tTopBar;
    #tColor;
    #tScore;

    /**
     * Controls name, color and score info for a team
     * @param {HTMLElement} nameEl - Team name element
     * @param {HTMLElement} topBar - Team top bar element
     * @param {Element} cssRoot - Where the css variables may be
     * @param {String} side - Side of team, L or R
     * @param {HTMLElement} scoreImg - Team score ticks
     * @param {HTMLElement} scoreNum - Team score number
     */
    constructor(nameEl, topBar, cssRoot, side, scoreImg, scoreNum) {

        this.#tName = new TeamName(nameEl);
        this.#tTopBar = new TeamTopBar(topBar);
        this.#tColor = new TeamColor(cssRoot, side);
        this.#tScore = new TeamScore(scoreImg, scoreNum, side);

    }

    getScore() {
        return this.#tScore.getScore();
    }

    /**
     * Updates team data (name, W/L, color and score)
     * @param {String} name - Team's name
     * @param {String} name - Team's W/L status
     * @param {Object} color - Team's color
     * @param {Number} score - Team's score
     */
    update(name, wl, color, score) {

        /* this.#tName.update(name); */
        this.#tTopBar.update(wl);
        /* this.#tColor.update(color.hex); */
        /* this.#tScore.update(score); */

    }

    /** Moves down the team's top bar */
    async hideTopBar() {
        await this.#tTopBar.hide();
    }

    /**
     * Moves the top bar up, showing it
     * @param {Number} delay - Time in seconds to wait until movement happens
     */
    showTopBar(delay) {
        this.#tTopBar.show(delay)
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