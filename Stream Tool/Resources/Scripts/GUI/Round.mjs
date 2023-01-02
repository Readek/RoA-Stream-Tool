import { settings } from "./Settings.mjs";
import { wl } from "./WinnersLosers.mjs";

class Round {

    #roundInp = document.getElementById('roundName');

    constructor() {

        // check if the round is grand finals whenever we type on round input
        this.#roundInp.addEventListener("input", () => {this.checkGrands()});

    }

    getText() {
        return this.#roundInp.value;
    }
    setText(text) {
        this.#roundInp.value = text;
    }

    /** Checks if the round text contains "Grands" so it shows/hides W/L buttons */
    checkGrands() {
        if (!settings.isForceWLChecked()) {
            if (this.getText().toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
                wl.show();
            } else {
                wl.hide();
            }
        }
    }

}

export const round = new Round;