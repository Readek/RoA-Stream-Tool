export class Team {

    #tNameInp;

    constructor(el) {

        this.#tNameInp = el.getElementsByClassName("teamName")[0];

    }

    getName() {
        return this.#tNameInp.value;
    }
    setName(text) {
        this.#tNameInp.value = text;
    }
    getNameInp() {
        return this.#tNameInp;
    }

}