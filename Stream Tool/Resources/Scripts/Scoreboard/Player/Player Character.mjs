import { fadeInMove } from "../../Utils/Fade In.mjs";
import { fadeOutMove } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";

export class PlayerCharacter {

    #charSrc = "";

    #charEl;

    /**
     * Controls the player's character, trail and bg video
     * @param {HTMLElement} charEl - Element containing character image
     */
    constructor(charEl) {

        this.#charEl = charEl;

    }

     /**
     * Updates the player's character element
     * @param {Object} data - Data for the VS Screen
     * @returns {Promise <() => void>} Promise with fade in animation function
     */
    async update(data) {

        // if that character image is not the same as the local one
        if (this.#charSrc != data.charImg) {

            // calculate delay for the final fade in
            const fadeInDelay = current.startup ? current.delay + .15 : 0;

            // remember the change
            this.#charSrc = data.charImg;
            
            // dont do this if loading
            if (!current.startup) {
                await fadeOutMove(this.#charEl, true, true);
            }

            // update that image
            this.#charEl.src = data.charImg;

            // position the character
            const pos = data.charPos;
            this.#charEl.style.transform = `translate(${pos[0]}px, ${pos[1]}px) scale(${pos[2]})`;

            // this will make the thing wait till the image is fully loaded
            await this.#charEl.decode();

            // return the fade in animation, to be used when rest of players load
            return () => this.fadeInChar(fadeInDelay);
            
        }

    }

    /** Fade that character in, will activate from the outside */
    fadeInChar(delay) {
        fadeInMove(this.#charEl, true, false, delay);
    }

    
    /**
     * Adapts the character image to singles or doubles
     * @param {Number} gamemode - New gamemode
     */
    changeGm(gamemode) {

        if (gamemode == 2) { // doubles
            this.#charEl.parentElement.parentElement.classList.add("charTop");
        } else { // singles
            this.#charEl.parentElement.parentElement.classList.remove("charTop");
        }

    }

    /** Hides the character's image */
    hide() {
        this.#charEl.parentElement.style.display = "none";
    }

    /** Displays hidden image, fading it in */
    show() {
        this.fadeInChar(current.delay+.15);
        this.#charEl.parentElement.style.display = "block";
    }

}