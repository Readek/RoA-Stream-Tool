import { stPath } from './Globals.mjs';
import { settings } from "./Settings.mjs";
import { wl } from "./WinnersLosers.mjs";
import { getJson } from './File System.mjs';
import { bestOf } from './BestOf.mjs';
import { displayNotif } from './Notifications.mjs';

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

            // add colors to the list
            roundOption.style.backgroundColor = "var(--bg5)";
            if (roundList[i].showNumber) {
                roundOption.style.backgroundColor = "var(--bg2)";
            }

            this.#roundSelect.appendChild(roundOption);

        }

        // add in additional custom and none options
        const customOption = document.createElement('option');
        customOption.value = "";
        customOption.innerHTML = "(custom text)";
        customOption.style.backgroundColor = "var(--bg5)";
        this.#roundSelect.appendChild(customOption);

        const noneOption = document.createElement('option');
        noneOption.value = "";
        noneOption.innerHTML = "(none)";
        noneOption.style.backgroundColor = "var(--bg5)";
        this.#roundSelect.appendChild(noneOption);

        // function to call when selecting an option
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
            this.updateSelect();

        }
        
    }

    getIndex() {
        return this.#roundSelect.selectedIndex;
    }
    getNumber() {
        return this.#roundNumber.value
    }

    updateSelect() {

        if (this.#roundSelect.selectedIndex == roundList.length) { // custom text
            displayNotif("You can restore round select in settings");
            settings.setCustomRound(true);
            settings.toggleCustomRound();
            this.#roundSelect.selectedIndex = 0; // to avoid bugs later
        } else {
            
            if (this.#roundSelect.selectedIndex < roundList.length) {
    
                // check if the round forces a bestOf state
                if (roundList[this.#roundSelect.selectedIndex].forceBestOf) {
                    bestOf.setBo(roundList[this.#roundSelect.selectedIndex].forceBestOf);
                }
    
            }
    
            // show, or not, the round number input
            if (this.isNumberNeeded()) {
                this.showNumberInput();
            } else {
                this.hideNumberInput();
            }
    
            // of course, check for grands
            this.checkGrands();

        }

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
        if (this.#roundSelect.selectedIndex < roundList.length - 1) {
            return roundList[this.#roundSelect.selectedIndex].showNumber;
        } else {
            return false;
        }        
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