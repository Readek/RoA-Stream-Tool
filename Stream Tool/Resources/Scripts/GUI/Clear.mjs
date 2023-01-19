import { displayNotif } from "./Notifications.mjs";
import { clearPlayers } from "./Player/Players.mjs";
import { clearScores } from "./Score/Scores.mjs";
import { clearTeams } from "./Team/Teams.mjs";

document.getElementById('clearButton').addEventListener("click", clear);

/** Resets player, score and team data */
export function clear() {
    
    // clear the team names
    clearTeams();
    clearPlayers();
    clearScores();

    displayNotif("Cleared all player data");

}