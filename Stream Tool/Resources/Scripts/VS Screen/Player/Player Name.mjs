import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { gamemodeClass } from "../Gamemode Change.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "../VsGlobals.mjs";

const playerSize = 90;
const tagSize = 50;
const playerSizeDubs = 45;
const tagSizeDubs = 25;

export class PlayerName {

    #name = "";
    #tag = "";

    #nameEl;
    #tagEl;
    #wrapperEl;

    /**
     * Controls the player's name and tags
     * @param {HTMLElement} nameEl - Name element
     * @param {HTMLElement} tagEl - Tag element
     */
    constructor(nameEl, tagEl) {
        this.#nameEl = nameEl;
        this.#tagEl = tagEl;
        this.#wrapperEl = nameEl.parentElement;
    }

    getName() {
        return this.#name;
    }
    #setName(name) {

        this.#name = name;

        // set the displayed text
        this.#nameEl.innerHTML = name;

        // resize it depending on the gamemode
        if (gamemodeClass.getGm() == 1) {
            this.#nameEl.style.fontSize = playerSize + "px";
        } else {
            this.#nameEl.style.fontSize = playerSizeDubs + "px";
        }

    }

    getTag() {
        return this.#tag;
    }
    #setTag(tag) {

        this.#tag = tag;

        // set the displayed text
        this.#tagEl.innerHTML = tag;

        // resize it depending on the gamemode
        if (gamemodeClass.getGm() == 1) {
            this.#tagEl.style.fontSize = tagSize + "px";
        } else {
            this.#tagEl.style.fontSize = tagSizeDubs + "px";
        }

    }

    async update(data) {

        let delayTime = introDelayVs + .3;

        // if not loading up
        if (!current.startup) {

            // we wont need delay
            delayTime = 0;
            // wait for the fadeout to proceed
            await fadeOut(this.#wrapperEl, fadeOutTimeVs);

        }

        // update them texts
        this.#setName(data.name);
        this.#setTag(data.tag);
        resizeText(this.#wrapperEl);

        // and fade everything in!
        fadeIn(this.#wrapperEl, fadeInTimeVs, delayTime);

    }

}