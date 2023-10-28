import { RoundTournament } from "./Round Tournament.mjs";

export class Round extends RoundTournament {

    constructor() {
        super()
        this._element = document.getElementById("round");
        this._fontSize = 30;
    }

}
