import { currentColors } from "../Colors.mjs";

export class Team {

    #tNameInp;
    #num;

    constructor(el, num) {

        this.#tNameInp = el.getElementsByClassName("teamName")[0];
        this.#num = num;

    }

    getName() {
        return this.#tNameInp.value;
    }
    setName(text) {
        // dont set anything if this is just [Color] Team
        if (text == currentColors[this.#num - 1].name + " Team") {
            this.#tNameInp.value = "";
        } else {
            this.#tNameInp.value = text;
        }
    }
    getNameInp() {
        return this.#tNameInp;
    }

}