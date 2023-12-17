import { fadeIn } from "../Utils/Fade In.mjs";
import { fadeOut } from "../Utils/Fade Out.mjs";
import { current } from "../Utils/Globals.mjs";
import { updateText } from "../Utils/Update Text.mjs";
import { fadeInTimeSc, fadeOutTimeSc } from "./ScGlobals.mjs";

const roundEl = document.getElementById('roundBorder');
const textEl = document.getElementById('roundText');
const fontSize = 18;

class Round {

    #text = "";

    #setText(text) {
        this.#text = text;
    }

    /**
     * Updates round text, fading elements in and out if necessary
     * @param {String} text - Round text to display
     */
    async update(text) {

        // if old doesnt match with new
        if (this.#text != text) {

            // we will want to wait longer if loading up
            let fadeInDelay = .1;

            if (!current.startup) {
                // if not loading, fade out the text (and wait for it)
                await fadeOut(textEl, fadeOutTimeSc);
            } else {
                // if loading, add an extra delay to fade in for later
                fadeInDelay = current.delay;
            }

            // update local text
            this.#setText(text);

            // update the displayed text
            updateText(textEl, this.#text, fontSize);

            // resize the background if necessary
            this.#resizeDiv();

            // if theres no text, hide everything
            if (this.#text) {

                // fade in the round element
                fadeIn(roundEl, fadeInTimeSc, fadeInDelay);

                // fade in the round text
                fadeIn(textEl, fadeInTimeSc, fadeInDelay);

            } else {
                // fade out the round element
                fadeOut(roundEl, fadeOutTimeSc);
            }

        }

    }
    
    /** Resizes the round div with a smooth transition */
    #resizeDiv() {

        // dirty tricks to gather data
        const prevWidth = window.getComputedStyle(roundEl).width;
        roundEl.style.width = "auto";
        const nextWidth = window.getComputedStyle(roundEl).width;
        roundEl.style.width = prevWidth;
        
        // now we need to do this on the next tick or else transition wont trigger
        roundEl.offsetWidth; // force finish css calcs
        roundEl.style.width = nextWidth;

    }

    /** Hides the round element */
    hide() {

        roundEl.style.display = "none";

    }

    /** Shows the logo image */
    show() {

        fadeIn(roundEl, fadeInTimeSc, current.delay);
        roundEl.style.display = "flex";

    }

}

export const round = new Round; // todo update name