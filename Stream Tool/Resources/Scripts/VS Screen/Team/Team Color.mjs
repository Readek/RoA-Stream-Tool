export class TeamColor {

    #cssRoot;
    #side;

    #color = "";

    /**
     * Controls the colors of a team
     * @param {Element} cssRoot - CSS root where variables are set
     * @param {String} side - Side of the team, L or R
     */
    constructor(cssRoot, side) {

        this.#cssRoot = cssRoot;
        this.#side = side;

    }

    /**
     * Updates the color of all DOM elements
     * @param {String} color - Color in #hex
     */
    update(color) {

        // if old color is different than new
        if (this.#color != color) {

            // this used to be way more complicated, but man, you can
            // do basically everything with just css nowadays
            this.#cssRoot.style.setProperty("--color" + this.#side, color);
            
        }

    }

}