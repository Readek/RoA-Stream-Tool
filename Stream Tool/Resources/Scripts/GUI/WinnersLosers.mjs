class WinnersLosers {

    #wlButtons = document.getElementsByClassName("wlButtons");
    leftW = document.getElementById('p1W');
    leftL = document.getElementById('p1L');
    rightW = document.getElementById('p2W');
    rightL = document.getElementById('p2L');

    #currentLeft = "";
    #currentRight = "";

    constructor() {

        // set click listeners for the [W] and [L] buttons
        this.leftW.addEventListener("click", (e) => {this.setLeft(e.target)});
        this.leftL.addEventListener("click", (e) => {this.setLeft(e.target)});
        this.rightW.addEventListener("click", (e) => {this.setRight(e.target)});
        this.rightL.addEventListener("click", (e) => {this.setRight(e.target)});

    }

    getWLButtons() {
        return this.#wlButtons;
    }
    getLeft() {
        return this.#currentLeft;
    }
    setLeft(el) {
        if (el == this.leftW) {
            this.#currentLeft = "W";
            this.#styleButtons(el, this.leftL);
        } else if (el == this.leftW) {
            this.#currentLeft = "L";
            this.#styleButtons(el, this.leftW);
        }
    }
    getRight() {
        return this.#currentRight;
    }
    setRight(el) {
        if (el == this.rightW) {
            this.#currentRight = "W";
            this.#styleButtons(el, this.rightL);
        } else if (el == this.rightW) {
            this.#currentRight = "L";
            this.#styleButtons(el, this.rightW);
        }
    }

    /**
     * Styles the W/L buttons depending of current values
     * @param {HTMLElement} active - Clicked element
     * @param {HTMLElement} notActive - !Clicked element
     */
    #styleButtons(active, notActive) {
        active.style.color = "var(--text1)";
        notActive.style.color = "var(--text2)";
        active.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        notActive.style.backgroundImage = "var(--bg4)";
    }

    /** Resets W/L values to none */
    #deactivateWL() {
        this.#currentLeft = "";
        this.#currentRight = "";
    
        const pWLs = document.getElementsByClassName("wlBox");
        for (let i = 0; i < pWLs.length; i++) {
            pWLs[i].style.color = "var(--text2)";
            pWLs[i].style.backgroundImage = "var(--bg4)";
        }
    }

    /** Hides all W/L buttons (and resets values to none) */
    hide() {
        for (let i = 0; i < this.getWLButtons().length; i++) {
            this.getWLButtons()[i].style.display = "none";
            this.#deactivateWL();
        }
    }
    /** Shows all W/L buttons */
    show() {
        for (let i = 0; i < this.getWLButtons().length; i++) {
            this.getWLButtons()[i].style.display = "flex";
        }
    }

}

export const wl = new WinnersLosers;