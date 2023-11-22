import { PlayerName } from "./Player Name.mjs";

export class Player {

    #pName;

    #pronouns = "";
    #socials = {};


    constructor(wrapEl, infoEl, charaEl, bgEl) {

        // player name and tag
        const nameEl = wrapEl.getElementsByClassName("name")[0];
        const tagEl = wrapEl.getElementsByClassName("tag")[0];
        this.#pName = new PlayerName(nameEl, tagEl);

    }


    getName() {
        return this.#pName.getName();
    }

    getTag() {
        return this.#pName.getTag();
    }

    getPronouns() {
        return this.#pronouns;
    }
    setPronouns(pronouns) {
        this.#pronouns = pronouns;
    }

    getSocials() {
        return this.#socials;
    }
    setSocials(socials) {
        this.#socials = socials;
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

    updateInfo(data) {

    }

    updateChar(data) {

    }

    updateBG(data) {

    }

}