import { Team } from "./Team.mjs";

class Teams {

    /** @type {Team[]} */
    #teams = [];

    constructor() {

        // gather the data needed for our classes
        const nameEls = document.getElementsByClassName("teamName");
        const topBars = document.getElementsByClassName("topBarTexts");
        const cssRoot = document.querySelector(':root');
        const scoreImgs = document.getElementsByClassName("scoreImgs");
        const scoreNums = document.getElementsByClassName("scoreNum");

        // for both sides, create them teams
        this.#teams.push(
            new Team(nameEls[0], topBars[0], cssRoot, "L", scoreImgs[0], scoreNums[0]),
            new Team(nameEls[1], topBars[1], cssRoot, "R", scoreImgs[1], scoreNums[1]),
        );

    }

    /**
     * Updates team data (names, W/L, colors and scores)
     * @param {Array} name - Current team names
     * @param {Array} wl - Current team W/L status
     * @param {Array} color - Current team colors
     * @param {Array} score - Current team scores
     */
    update(name, wl, color, score) {

        for (let i = 0; i < this.#teams.length; i++) {
            this.#teams[i].update(name[i], wl[i], color[i], score[i]);
        }

    }

    /**
     * Moves down the team's top bar
     * @param {String} side - L for left team or R for right team
     */
    async hideTopBar(side) {
        const teamNum = side == "L" ? 0 : 1;
        await this.#teams[teamNum].hideTopBar();
    }

    /**
     * Moves the top bar up, showing it
     * @param {Number} delay - Time in seconds to wait until movement happens
     * @param {String} side - L for left team or R for right team
     */
    async showTopBar(delay, side) {
        const teamNum = side == "L" ? 0 : 1;
        await this.#teams[teamNum].showTopBar(delay);
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