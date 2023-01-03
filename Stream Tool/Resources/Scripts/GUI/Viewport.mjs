import { inside } from "./Globals.mjs";

class Viewport {

    #viewport = document.getElementById('viewport');
    #goBackDiv = document.getElementById('goBack');
    #overlayDiv = document.getElementById('overlay');

    constructor() {
        //if the viewport is moved, click anywhere on the center to go back
        this.#goBackDiv.addEventListener("click", () => {this.toCenter()});
    }

    /** Moves the viewport back to the center */
    toCenter() {

        this.#goBackDiv.style.display = "none";
        this.opacity("1");
        this.#moveViewport("0");
        inside.bracket = false;
        inside.settings = false;

    }

    /** Moves the viewport sightly to see the settings */
    toSettings() {

        inside.settings = true;
        this.#goBackDiv.style.display = "block";
        this.opacity(".25");
        this.#moveViewport("-240px");

    }

    /** Moves the viewport to bracket editor */
    toBracket() {

        inside.bracket = true;
        this.opacity(".25");
        this.#moveViewport("100%");

    }

    #moveViewport(pos) {

        this.#viewport.style.transform = `translateX(${pos})`;

    }

    /**
     * Changes the opacity of the base viewport for overlayed divs
     * @param {String} value CSS value for opacity
     */
    opacity(value) {

        this.#overlayDiv.style.opacity = value;

    }

}

export const viewport = new Viewport;