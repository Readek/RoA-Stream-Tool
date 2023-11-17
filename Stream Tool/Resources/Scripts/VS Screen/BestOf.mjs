const scoreImg = document.getElementsByClassName("scoreTick");
const scoreBorder = document.getElementById("scoreBorder");
const scoreTicks = document.getElementById("scoreTicks");
const scoreNumerical = document.getElementById("scoreNumerical");

class BestOf {

    #bestOf = "";

    /**
     * Updates Best Of info with the provided state
     * @param {String} bestOf - Best Of state, can be Number
     */
    update(bestOf) {

        // if old doesnt match with new
        if (this.#bestOf != bestOf) {
            
            // show or hide a bunch of elements
            if (bestOf == 5) {
                scoreTicks.style.display = "block";
                scoreNumerical.style.display = "none";
                scoreImg[2].style.opacity = 1;
                scoreImg[5].style.opacity = 1;
                scoreBorder.src = "Resources/Overlay/VS Screen/Score Border Bo5.png";
            } else if (bestOf == 3) {
                scoreTicks.style.display = "block";
                scoreNumerical.style.display = "none";
                scoreImg[2].style.opacity = 0;
                scoreImg[5].style.opacity = 0;
                scoreBorder.src = "Resources/Overlay/VS Screen/Score Border Bo3.png";
            } else if (bestOf == "X") {
                scoreTicks.style.display = "none";
                scoreNumerical.style.display = "flex";
            }

            // store the new state
            this.#bestOf = bestOf;

        }

    }

}

export const bestOf = new BestOf;