import { scores } from "./Scores.mjs";

class BestOf {

    #currentBestOf = 5;

    constructor() {

        document.getElementById("bestOf").addEventListener("click", () => {
            this.#changeBestOf();
        });

    }

    getBo() {
        return this.#currentBestOf;
    }

    /** Changes "Best of"'s value */
    #changeBestOf() {

        if (this.#currentBestOf == 5) {

            this.#currentBestOf = 3;

            // change the visual text
            this.innerHTML = "Best of 3";
            this.title = "Click to change the scoring to Best of X";

            // hide the last score tick from the score ticks
            scores[0].showBo3();
            scores[1].showBo3();

        } else if (this.#currentBestOf == 3) {

            this.#currentBestOf = "X";

            this.innerHTML = "Best of X";
            this.title = "Click to change the scoring to Best of 5";

            scores[0].showBoX();
            scores[1].showBoX();
            

        } else if (this.#currentBestOf == "X") {

            this.#currentBestOf = 5;

            this.innerHTML = "Best of 5";
            this.title = "Click to change the scoring to Best of 3";

            scores[0].showBo5();
            scores[1].showBo5();

        }

    }

}

export const bestOf = new BestOf;