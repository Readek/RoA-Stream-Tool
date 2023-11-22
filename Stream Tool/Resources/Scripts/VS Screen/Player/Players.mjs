import { Player } from "./Player.mjs";

class Players {

    /** @type {Player[]} */
    #players = [];

    constructor() {

        // add new players to our array, max 4 players for 2v2
        for (let i = 0; i < 4; i++) {

            // gather the data needed for our classes
            const wrapEl = document.getElementById(`p${i+1}Wrapper`);

            // and create them
            this.#players.push(new Player(wrapEl));

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

}

export const players = new Players;