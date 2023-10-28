import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { fadeInTime, fadeOutTime } from "../VsGlobals.mjs";

export class RoundTournament {

    /** @protected {HTMLElement} */
    _element;

    /** @protected {Number} */
    _fontSize;

    /** @protected {String} */
    _text;

    getText() {
        return this._text;
    }

    /**
     * Updates the displayed text
     * @param {String} text - Text to display
    */
    setText(text) {

        this._text = text;
        updateText(this._element, text || "-", this._fontSize);

    }

    getElement() {
        return this._element;
    }

    async fadeOut() {
        await fadeOut(this._element, fadeOutTime);
    }

    fadeIn() {
        fadeIn(this._element, fadeInTime, .2);
    }

}
