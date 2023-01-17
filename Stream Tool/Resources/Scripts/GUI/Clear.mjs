import { clearPlayers } from "./Player/Players.mjs";
import { clearScores } from "./Scores.mjs";
import { clearTeams } from "./Teams.mjs";

document.getElementById('clearButton').addEventListener("click", clear);

/** Resets player, score and team data */
export function clear() {
    
    // clear the team names
    clearTeams();
    clearPlayers();
    clearScores();

}