import { charaFadeIn, fadeIn } from "../../Utils/Fade In.mjs";
import { charaFadeOut, fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "../VsGlobals.mjs";

export class PlayerCharacter {

    #charSrc = "";
    #trailSrc = "";
    #bgSrc = "";

    #charEl;
    #trailEl;
    #charDiv;
    #bgEl;

    /**
     * Controls the player's character, trail and bg video
     * @param {HTMLElement} charEl - Elemeent containing character image
     * @param {HTMLElement} trailEl - Element containing trail image
     * @param {HTMLElement} bgEl - Element containing background video
     * @param {Number} id - Player slot
     */
    constructor(charEl, trailEl, bgEl) {

        this.#charEl = charEl;
        this.#trailEl = trailEl;
        this.#bgEl = bgEl;

        // to animate both char and trail at once
        this.#charDiv = charEl.parentElement;

    }

     /**
     * Updates all player's character elements
     * @param {Object} vsData - Data for the VS Screen
     * @returns {Promise <() => void>} Promise with fade in animation function
     */
    update(vsData) {

        // update that background
        this.#updateBg(vsData.bgVid);

        // update that character
        return this.#updateChar(vsData);

    }

    /**
     * Updates character and trail images
     * @param {Object} vsData - Data for the VS Screen
     * @returns {Promise <() => void>} Promise with fade in animation function
     */
    async #updateChar(data) {

        // if that character image is not the same as the local one
        if (this.#charSrc != data.charImg || this.#trailSrc != data.trailImg) {

            // calculate delay for the final fade in
            const fadeInDelay = current.startup ? introDelayVs : 0;

            // remember the change
            this.#charSrc = data.charImg;
            this.#trailSrc = data.trailImg;
            
            // dont do this if loading
            if (!current.startup) {
                await charaFadeOut(this.#charDiv, this.#trailEl, fadeOutTimeVs);
            }

            // update those images
            this.#charEl.src = data.charImg;
            this.#trailEl.src = data.trailImg;

            // position the character
            const pos = data.charPos;
            this.#charEl.style.transform = `translate(${pos[0]}px, ${pos[1]}px) scale(${pos[2]})`;
            this.#trailEl.style.transform = `translate(${pos[0]}px, ${pos[1]}px) scale(${pos[2]})`;

            // since most images are large pixel arts, only do regular
            // rendering if skin name includes "HD" on it
            if (data.skin.includes("HD")) {
                this.#charEl.style.imageRendering = "auto"; // default scalling
                this.#trailEl.style.imageRendering = "auto";
            } else {
                this.#charEl.style.imageRendering = "pixelated"; // pixel art scalling
                this.#trailEl.style.imageRendering = "pixelated";
            }

            // here we will store promises to use later
            const charsLoaded = [];
            // this will make the thing wait till the images are fully loaded
            charsLoaded.push(this.#charEl.decode(),
                this.#trailEl.decode().catch( () => {} ) // if no trail, do nothing
            );
            // this function will send a promise when the images finish loading
            await Promise.all(charsLoaded);

            // return the fade in animation, to be used when rest of players load
            return () => this.fadeInChar(fadeInDelay);
            
        }

    }

    /** Fade that character in, will activate from the outside */
    fadeInChar(delay) {
        charaFadeIn(this.#charDiv, this.#trailEl, fadeInTimeVs, delay);
    }

    /**
     * Updates the character's background video
     * @param {String} bgSrc - Background source path
     */
    async #updateBg(bgSrc) {

        // if the path isnt the same
        if (this.#bgSrc != bgSrc) {

            // if not loading everything up
            if (!current.startup) {
                // fade out the background
                await fadeOut(this.#bgEl, fadeOutTimeVs+.2);
            }

            // update it
            this.#bgEl.src = bgSrc;

            // and show it!
            if (!current.startup) {
                fadeIn(this.#bgEl, fadeInTimeVs, .3);
            }

            // remember, remember
            this.#bgSrc = bgSrc;

        }

    }
    
    /**
     * Adapts the character elements to singles or doubles
     * @param {Number} gamemode - New gamemode
     */
    changeGm(gamemode) {

        if (gamemode == 1) { // singles
            this.#charDiv.parentElement.classList.add("singlesClip");
            this.#charDiv.parentElement.classList.remove("dubsClip");
        } else { // doubles
            this.#charDiv.parentElement.classList.remove("singlesClip");
            this.#charDiv.parentElement.classList.add("dubsClip");
        }

    }

    /** Hides the character's images */
    hide() {
        this.#charDiv.style.display = "none";
        this.#bgEl.style.display = "none";
        this.#bgEl.style.animation = "";
    }

    /** Displays hidden images, fading them in */
    show() {
        charaFadeIn(this.#charDiv, this.#trailEl, fadeInTimeVs, introDelayVs);
        this.#charDiv.style.display = "block";
        this.#bgEl.style.display = "block";
    }

}