import { gamemode } from "../Gamemode Change.mjs";
import { Player } from "./Player.mjs";

const topRow = document.getElementById("topRow");

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
            pChar.forEach(fade => {
                if (fade) fade() // promise can return undefined if no update
            });
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
            this.#players[i].changeGm(gamemode);
        }

        // reposition the top characters (bot ones are already positioned)
        if (gamemode == 1) {
            topRow.style.top = "0";
        } else {
		    topRow.style.top = "-180px";
        }

    }

    /** Hides some elements when browser goes out of view */
    hide() {

        for (let i = 0; i < this.#players.length; i++) {
            this.#players[i].hide();            
        }

    }

    /** Returns some elements back to view, animating them */
    show() {

        // this is for hiding sometimes residual player info for players 3 and 4
        const itTimes = gamemode.getGm() == 1 ? 2 : 4;

        for (let i = 0; i < itTimes; i++) {
            this.#players[i].show();
        }

    }

}

export const players = new Players;