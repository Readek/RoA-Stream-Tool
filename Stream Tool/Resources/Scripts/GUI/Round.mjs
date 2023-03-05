import { stPath } from './Globals.mjs';
import { settings } from "./Settings.mjs";
import { wl } from "./WinnersLosers.mjs";
import { getJson } from './File System.mjs';

const roundList = await getJson(stPath.text + "/Round Names");

class Round {

    #roundInp = document.getElementById('roundName');
    #roundSelectInp = document.getElementById('roundNameSelect');
    #roundNumberInp = document.getElementById('roundNameNumber');

    
    constructor() {

        // check if the round is grand finals whenever we type on round input
        this.#roundInp.addEventListener("input", () => {this.checkGrands()});
        this.#roundSelectInp.addEventListener("input", () => {this.checkGrands()});
        for (var i = 0; i < roundList.length; i++) {
            var roundOption = document.createElement('option');
            roundOption.value = roundList[i];
            roundOption.innerHTML = roundList[i];
            this.#roundSelectInp.appendChild(roundOption);
        }
        
    }

    getText() {
        var roundName = "";
        if (settings.useCustomRound()) {
            roundName = this.#roundInp.value;
        } else {
            roundName = this.#roundSelectInp.value;
            if (roundName.indexOf('Round') != -1) {
                this.#roundNumberInp.style.display = 'flex';
                if (this.#roundNumberInp.value > 0) {
                    roundName += " " + + this.#roundNumberInp.value;
                }
            } else {
                this.#roundNumberInp.style.display = 'none';
            }
            this.#roundInp.value = roundName;
        }

        return roundName;
    }
    setText(text) {
        if (settings.useCustomRound()) {
            this.#roundInp.value = text;
        } else {
            var number = "";
            var numberArr = text.match(/(\d{1,})/g);
            if (numberArr && numberArr.length > 0) {
                number = numberArr[1];      
            }

            if (number) {
                text.replace(number, '');
                text.trim();
            }

            this.#roundSelectInp.value = text;
            this.#roundNumberInp.value = number;
        }
        
    }

    hide () {
        this.#roundInp.style.display = 'none';
        this.#roundSelectInp.style.display = 'flex';
        if (this.getText().indexOf('Round') != -1) {
            this.#roundNumberInp.style.display = 'flex';
        } else {
            this.#roundNumberInp.style.display = 'none';
        }
        
    }

    show () {
        this.#roundInp.style.display = 'flex';
        this.#roundSelectInp.style.display = 'none';
        this.#roundNumberInp.style.display = 'none';
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