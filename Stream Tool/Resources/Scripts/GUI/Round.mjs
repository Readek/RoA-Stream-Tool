import { stPath } from './Globals.mjs';
import { settings } from "./Settings.mjs";
import { wl } from "./WinnersLosers.mjs";
import { getJson } from './File System.mjs';

const roundList = await getJson(stPath.text + "/Round Names");

class Round {

    #roundInp = document.getElementById('roundName');
    #roundSelect = document.getElementById('roundNameSelect');
    #roundNumber = document.getElementById('roundNameNumber');

    
    constructor() {

        // check if the round is grand finals whenever we type on round input
        this.#roundInp.addEventListener("input", () => {this.checkGrands()});
        
        // create the round select list
        for (let i = 0; i < roundList.length; i++) {
            const roundOption = document.createElement('option');
            roundOption.value = roundList[i].name;
            roundOption.innerHTML = roundList[i].name;
            roundOption.style.backgroundColor = "var(--bg5)";
            if (roundList[i].showNumber) {
                roundOption.style.backgroundColor = "var(--bg2)";
            }
            this.#roundSelect.appendChild(roundOption);
        }

        this.#roundSelect.addEventListener("change", () => {this.updateSelect()});
        
    }

    getText() {

        let roundName = "";

        if (settings.isCustomRoundChecked()) { // regular text input
            roundName = this.#roundInp.value;
        } else { // round select
            roundName = this.#roundSelect.value;
            // add in the round number if used
            if (this.isNumberNeeded()) {
                roundName += " " + this.#roundNumber.value;
            }
            // update the hidden text input
            this.#roundInp.value = roundName;

        }

        return roundName;

    }
    setText(text, index, number) {

        this.#roundInp.value = text;

        // if using the round select
        if (!settings.isCustomRoundChecked()) {

            // add in the number text to the hidden text input, if needed
            if (this.isNumberNeeded()) {
                this.#roundInp.value = text + " " + number;
            }
            
            // update the select and number values
            this.#roundSelect.selectedIndex = index;
            this.#roundNumber.value = number;

        }
        
    }

    getIndex() {
        return this.#roundSelect.selectedIndex;
    }
    getNumber() {
        return this.#roundNumber.value
    }

    updateSelect() {

        // set the new name
        this.#roundSelect.value = roundList[this.#roundSelect.selectedIndex].name;

        // show, or not, the round number input
        if (this.isNumberNeeded()) {
            this.showNumberInput();
        } else {
            this.hideNumberInput();
        }

        // of course, check for grands
        this.checkGrands();

    }

    hideTextInput() {
        this.#roundInp.style.display = 'none';
        this.#roundSelect.style.display = 'flex';
        if (this.isNumberNeeded()) {
            this.showNumberInput();
        } else {
            this.hideNumberInput();
        }
        
    }
    showTextInput() {
        this.#roundInp.style.display = 'flex';
        this.#roundSelect.style.display = 'none';
        this.hideNumberInput();
    }

    hideNumberInput() {
        this.#roundNumber.style.display = 'none';
    }
    showNumberInput() {
        this.#roundNumber.style.display = 'flex';
    }

    /**
     * Checks if the currently selected round needs a number
     * @returns {Boolean}
     */
    isNumberNeeded() {
        return roundList[this.#roundSelect.selectedIndex].showNumber;
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