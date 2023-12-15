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
     * @param {HTMLElement} scoreboardEl - The entire scoreboard for this team
     * @param {Element} cssRoot - Where the css variables may be
     * @param {String} side - Side of team, L or R
     */
    constructor(scoreboardEl, cssRoot, side) {

        // gather the data needed for our classes
        const nameEl = scoreboardEl.getElementsByClassName("teamName")[0];

        const topBar = scoreboardEl.getElementsByClassName("topBarTexts")[0];

        const colorImg = scoreboardEl.getElementsByClassName("colors")[0];

        const scoreImg = scoreboardEl.getElementsByClassName("scoreImgs")[0];
        const scoreNum = scoreboardEl.getElementsByClassName("scoreNum")[0];
        const scoreVid = scoreboardEl.getElementsByClassName("scoreVid")[0];

        // and create those internal classes
        this.#tName = new TeamName(nameEl, side);
        this.#tTopBar = new TeamTopBar(topBar);
        this.#tColor = new TeamColor(cssRoot, colorImg, side);
        this.#tScore = new TeamScore(scoreImg, scoreNum, scoreVid, side);

    }

    /**
     * Gets this team's name class
     * @returns {TeamName}
     */
    name() {
        return this.#tName;
    }

    /**
     * Gets this team's top bar class
     * @returns {TeamTopBar}
     */
    topBar() {
        return this.#tTopBar;
    }

    /**
     * Gets this team's color class
     * @returns {TeamColor}
     */
    color() {
        return this.#tColor;
    }

    /**
     * Gets this team's score class
     * @returns {TeamScore}
     */
    score() {
        return this.#tScore;
    }

    /**
     * Updates team data (name, W/L, color and score)
     * @param {String} name - Team's name
     * @param {String} name - Team's W/L status
     * @param {Object} color - Team's color
     * @param {Number} score - Team's score
     */
    update(name, wl, color, score) {

        this.#tName.update(name);
        this.#tTopBar.update(wl);
        this.#tColor.update(color);
        this.#tScore.update(score);

    }

    /**
     * Adapts the team to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {
        this.#tTopBar.changeGm(gamemode);
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