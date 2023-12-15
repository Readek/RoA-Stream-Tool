import { Team } from "./Team.mjs";

class Teams {

    /** @type {Team[]} */
    #teams = [];

    constructor() {

        // gather the data needed for our classes
        const scoreboardEls = document.getElementsByClassName("scoreboard");
        const cssRoot = document.querySelector(':root');

        // for both sides, create them teams
        this.#teams.push(
            new Team(scoreboardEls[0], cssRoot, "L"),
            new Team(scoreboardEls[1], cssRoot, "R"),
        );

    }

    /**
     * Gets the selected team class
     * @param {Number} teamNumber - 0 for left, 1 for right
     * @returns {Team}
     */
    team(teamNumber) {
        return this.#teams[teamNumber];
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
     * Adapts team elements to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {
        this.#teams[0].changeGm(gamemode);
        this.#teams[1].changeGm(gamemode);
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