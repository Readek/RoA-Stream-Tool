import { PlayerCharacter } from "./Player Character.mjs";
import { PlayerInfo } from "./Player Info.mjs";
import { PlayerName } from "./Player Name.mjs";

export class Player {

    #pName;
    #pInfo;
    #pChar;

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

        // player character
        const charEl = charaEl.getElementsByClassName("char")[0];
        const trailEl = charaEl.getElementsByClassName("trail")[0];
        this.#pChar = new PlayerCharacter(charEl, trailEl, bgEl);

    }


    /**
     * Update player name and tag, fading them out and in
     * @param {String} name - Name of the player
     * @param {String} tag - Tag of the player
     */
    updateName(name, tag) {

        // if either name or tag do not match
        if (name != this.#pName.getName() || tag != this.#pName.getTag()) {
            this.#pName.update(name, tag);
        }

    }

    /**
     * Updates the displayed player info (pronouns, socials)
     * @param {String} pronouns - The player's pronouns
     * @param {Object} socials - The player's socials
     */
    updateInfo(pronouns, socials) {

        if (this.#pInfo.hasChanged(pronouns, socials)) {
            this.#pInfo.update(pronouns, socials);
        }

    }

    /**
     * Updates all player's character elements
     * @param {Object} vsData - Data for the VS Screen
     * @returns {Promise <() => void>} Promise with fade in animation function
     */
    updateChar(vsData) {

        return this.#pChar.update(vsData);

    }

    /**
     * Adapts player to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {
        this.#pName.changeGm(gamemode);
        this.#pInfo.changeGm(gamemode);
        this.#pChar.changeGm(gamemode);
    }

    /** Hides some stuff when browser goes out of view */
    hide() {
        this.#pName.hide();
        this.#pInfo.hide();
        this.#pChar.hide();
    }

    /** Display elements and animations when user comes back to the browser */
    show() {
        this.#pName.show();
        this.#pInfo.show();
        this.#pChar.show();
    }

}