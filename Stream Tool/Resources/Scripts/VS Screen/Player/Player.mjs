import { PlayerInfo } from "./Player Info.mjs";
import { PlayerName } from "./Player Name.mjs";

export class Player {

    #pName;
    #pInfo;

    /**
     * Manages all info related to a player on the VS Screen
     * @param {HTMLElement} wrapEl - Wrapper containing name and tag
     * @param {HTMLElement} infoEl - Element containing player info
     * @param {HTMLElement} charaEl - Element containing character and trail
     * @param {HTMLElement} bgEl - Character background video element
     * @param {Number} id - Player slot
     */
    constructor(wrapEl, infoEl, charaEl, bgEl, id) {

        // player name and tag
        const nameEl = wrapEl.getElementsByClassName("name")[0];
        const tagEl = wrapEl.getElementsByClassName("tag")[0];
        this.#pName = new PlayerName(nameEl, tagEl, id);

        // player info
        this.#pInfo = new PlayerInfo(infoEl, id);

    }


    /**
     * Update player name and tag, fading them out and in
     * @param {Object} data - Entire player data
     */
    updateName(data) {

        // if either name or tag do not match
        if (data.name != this.#pName.getName() || data.tag != this.#pName.getTag()) {
            this.#pName.update(data);
        }

    }

    /**
     * Updates the displayed player info (pronouns, socials)
     * @param {Object} data - Entire player data
     */
    updateInfo(data) {

        if (this.#pInfo.hasChanged(data)) {
            this.#pInfo.update(data);
        }

    }

    updateChar(data) {

    }

    updateBG(data) {

    }

    /**
     * Adapts player to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {
        this.#pName.changeGm(gamemode);
        this.#pInfo.changeGm(gamemode);
    }

}