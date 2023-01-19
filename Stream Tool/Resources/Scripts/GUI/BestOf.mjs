import { showScoreMode } from "./Score/Scores.mjs";

class BestOf {

    #currentBestOf = 5;
    #bestOfEl = document.getElementById("bestOf");
    
    constructor() {

        this.#bestOfEl.addEventListener("click", () => {
            this.#nextBestOf();
        });

    }

    getBo() {
        return this.#currentBestOf;
    }
    setBo(value) {
        this.#changeBestOf(value);
    }

    #nextBestOf() {
        if (this.#currentBestOf == 5) {
            this.setBo(3);
        } else if (this.#currentBestOf == 3) {
            this.setBo("X")
        } else if (this.#currentBestOf == "X") {
            this.setBo(5);
        }
    }

    #changeBestOf(value) {

        if (value == 3) {

            this.#currentBestOf = 3;

            // change the visual text
            this.#bestOfEl.innerHTML = "Best of 3";
            this.#bestOfEl.title = "Click to change the scoring to Best of X";

            // hide the last score tick from the score ticks
            showScoreMode(3);

        } else if (value == "X") {

            this.#currentBestOf = "X";

            this.#bestOfEl.innerHTML = "Best of X";
            this.#bestOfEl.title = "Click to change the scoring to Best of 5";

            showScoreMode("X");
            

        } else if (value == 5) {

            this.#currentBestOf = 5;

            this.#bestOfEl.innerHTML = "Best of 5";
            this.#bestOfEl.title = "Click to change the scoring to Best of 3";

            showScoreMode(5);

        }

    }

}

export const bestOf = new BestOf;