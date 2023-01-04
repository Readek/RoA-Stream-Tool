class Tournament {

    #tournamentInp = document.getElementById('tournamentName');

    getText() {
        return this.#tournamentInp.value;
    }
    setText(text) {
        this.#tournamentInp.value = text;
    }

}

export const tournament = new Tournament;