export class TeamColor {

    #cssRoot;
    #colorImg;
    #side;

    #color = {};

    /**
     * Controls the colors of a team
     * @param {Element} cssRoot - CSS root where variables are set
     * @param {HTMLElement} colorImg - Team color image
     * @param {String} side - Side of the team, L or R
     */
    constructor(cssRoot, colorImg, side) {

        this.#cssRoot = cssRoot;
        this.#colorImg = colorImg;
        this.#side = side;

    }

    /**
     * Gets name of currently used color by the team
     * @returns {String}
     */
    getColorName() {
        return this.#color.name;
    }

    /**
     * Updates the color of all DOM elements
     * @param {String} color - Color in #hex
     */
    update(color) {

        // if old color is different than new
        if (this.#color.scImg != color.scImg) {

            // this used to be way more complicated, but man, you can
            // do basically everything with just css nowadays
            this.#cssRoot.style.setProperty("--color" + this.#side, color.hex);

            // the team's color shape is a bit complicated for css
            // so we are just getting that from the GUI
            this.#colorImg.src = color.scImg;

            // store color info
            this.#color = color;
            
        }

    }

}