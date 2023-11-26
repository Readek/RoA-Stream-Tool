import { Player } from "./Player.mjs";

class Players {

    /** @type {Player[]} */
    #players = [];

    constructor() {

        const pInfoEls = document.getElementsByClassName("pInfo");
        const pCharEls = document.getElementsByClassName("chara");
        const pBgEls = document.getElementsByClassName("bgVid");

        // add new players to our array, max 4 players for 2v2
        for (let i = 0; i < 4; i++) {

            // gather the data needed for our classes
            const wrapEl = document.getElementById(`p${i+1}Wrapper`);

            // and create them
            this.#players.push(
                new Player(wrapEl, pInfoEls[i], pCharEls[i], pBgEls[i], i+1)
            );

        }

    }

    /**
     * Updates player names, info, characters and backgrounds
     * @param {Object} data - Data for all players
     */
    update(data) {

        // we will need to keep track of character loading
        const charsLoaded = [];

        // for every player sent
        for (let i = 0; i < data.length; i++) {

            // update player name and tag
            this.#players[i].updateName(data[i].name, data[i].tag);

            // update pronouns and socials
            this.#players[i].updateInfo(data[i].pronouns, data[i].socials);

            // update character
            charsLoaded.push(this.#players[i].updateChar(data[i].vs));

        }

        // when character images have fully lodaded, fade them in at once
        Promise.all(charsLoaded).then( (pChar) => {
            for (let i = 0; i < pChar.length; i++) {
                if (pChar[i]) {
                    pChar[i][0].fadeInChar(pChar[i][1]);
                }
            }
        })

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