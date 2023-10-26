import { RoundTournament } from "./Round Tournament.mjs";

class Tournament extends RoundTournament {

    constructor() {
        super();
        this._element = document.getElementById("tournament");
        this._fontSize = 28;
    }

}

export const tournament = new Tournament;