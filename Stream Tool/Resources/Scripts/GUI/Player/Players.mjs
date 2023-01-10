export const players = [];
export const bracketPlayers = [];

/** Checks if all players are ready to send an update */
export function playersReady() {
    let allReady = true;
    for (let i = 0; i < players.length; i++) {
        if (!players[i].getReadyState()) {
            allReady = false;
        }            
    }
    for (let i = 0; i < bracketPlayers.length; i++) {
        if (!bracketPlayers[i].getReadyState()) {
            allReady = false;
        } 
    }
    return allReady;
}