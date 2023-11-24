import { Player } from "./Player.mjs";

class Players {

    /** @type {Player[]} */
    #players = [];

    constructor() {

        const pInfoEls = document.getElementsByClassName("pInfo");

        // add new players to our array, max 4 players for 2v2
        for (let i = 0; i < 4; i++) {

            // gather the data needed for our classes
            const wrapEl = document.getElementById(`p${i+1}Wrapper`);

            // and create them
            this.#players.push(new Player(wrapEl, pInfoEls[i], null, null, i+1));

        }

    }

    /**
     * Updates player names, info, characters and backgrounds
     * @param {Object} data - Data for all players
     */
    update(data) {

        // for every player sent
        for (let i = 0; i < data.length; i++) {

            // update player name and tag
            this.#players[i].updateName(data[i]);

            // update pronouns and socials
            this.#players[i].updateInfo(data[i]);

            // update character
            this.#players[i].updateChar(data[i]);

            // update background
            this.#players[i].updateBG(data[i]);

        }

    }

    /**
     * Adapts players to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        // this only affects the first 2 players,
        // as players 3 and 4 are already configured
        for (let i = 0; i < 2; i++) {
            this.#players[i].changeGm(gamemode, i+1);
        }

    }

}

export const players = new Players;