import { RoundTournament } from "./Round Tournament.mjs";

export class Tournament extends RoundTournament {

    constructor() {
        super();
        this._element = document.getElementById("tournament");
        this._fontSize = 28;
    }

}
