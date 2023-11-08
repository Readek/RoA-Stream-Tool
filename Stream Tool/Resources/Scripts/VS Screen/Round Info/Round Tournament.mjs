import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "../VsGlobals.mjs";

export class RoundTournament {

    #element;
    #fontSize;
    #text = "-";

    /**
     * Manages texts related to round info
     * @param {HTMLElement} element - Element to be modified
     * @param {Number} fontSize - Max text font size
     */
    constructor(element, fontSize) {

        this.#element = element;
        this.#fontSize = fontSize;

    }

    getText() {
        return this.#text;
    }

    /**
     * Updates the displayed text
     * @param {String} text - Text to display
    */
    setText(text) {

        this.#text = text;
        updateText(this.#element, text || "-", this.#fontSize);

    }

    getElement() {
        return this.#element;
    }

    /** Fades out the element, returning a promise */
    async fadeOut() {
        await fadeOut(this.#element, fadeOutTimeVs);
    }

    /**Fades in the element */
    fadeIn() {
        fadeIn(this.#element, fadeInTimeVs, .2);
    }

}
