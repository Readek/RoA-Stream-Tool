import { fadeIn, fadeInMove } from "../Utils/Fade In.mjs";
import { fadeOut } from "../Utils/Fade Out.mjs";
import { maxSides } from "../Utils/Globals.mjs";
import { resizeText } from "../Utils/Resize Text.mjs";
import { fadeInTimeSc, introDelaySc } from "./ScGlobals.mjs";

const introDiv = document.getElementById('overlayIntro');
const introWhiteBarTop = document.getElementById("introWhiteBarTop");
const introWhiteBarBot = document.getElementById("introWhiteBarBot");
const pIntroEls = document.getElementsByClassName('pIntro');
const midTextEL = document.getElementById('midTextIntro');
const roundText = document.getElementById('roundIntro');
const tournamentText = document.getElementById('tNameIntro');
const textsIntro = document.getElementById("textsIntro");
const superCoolQuestionMark = document.getElementById("superCoolInterrogation");

const introFontSize = 85;

class ScoreboardIntro {

    /**
     * Plays a cool and sexy intro that covers the entire screen
     * @param {Object} data - All of the scoreboard data
     */
    play(data) {

        // set all things visible
        introDiv.style.opacity = 1;

        // move the white bars because it looks cool
        introWhiteBarTop.style.animation = `introWhiteBarTop .5s ${introDelaySc}s cubic-bezier(0, 0, .2, 1) both`;
        introWhiteBarBot.style.animation = `introWhiteBarBot .5s ${introDelaySc}s cubic-bezier(0, 0, .2, 1) both`;

        // if this is the first game, introduce players
        if (data.score[0] + data.score[1] == 0) { 

            // for each side
            for (let i = 0; i < maxSides; i++) {

                // update players intro text
                if (data.gamemode == 1) {

                    // if singles, show player 1 and 2 names
                    pIntroEls[i].textContent = data.player[i].name;

                } else { //if doubles

                    // if theres no team name, show player names
                    if (data.teamName[i] == data.color[i].name + " Team") {

                        pIntroEls[i].textContent = data.player[i].name + " & "
                            + data.player[i+2].name;

                    } else { // else, show the team name

                        pIntroEls[i].textContent = data.teamName[i];

                    }

                }

                // resize the font to its max size
                pIntroEls[i].style.fontSize = introFontSize + "px";
                // resize the text if its too large
                resizeText(pIntroEls[i]);

                // change the color of the player text shadows
                pIntroEls[i].style.textShadow = '0px 0px 20px ' + data.color[i].hex;
                
            };

            // player name fade in
            fadeInMove(pIntroEls[0], null, true, introDelaySc);
            fadeInMove(pIntroEls[1], null, false, introDelaySc);


        } else { // if its not the first game, show game count

            // if its not the last game of a bo5
            if ((data.score[0] + data.score[1]) != 4) {

                //just show the game count in the intro
                midTextEL.textContent = "Game " + (data.score[0] + data.score[1] + 1);

            } else { // if game 5

                // if true finals
                if ((data.round.toUpperCase() == "TRUE FINALS")) {

                    // i mean shit gets serious here
                    midTextEL.textContent = "True Final Game";
                    
                } else {

                    midTextEL.textContent = "Final Game";
                    
                    // if GF, we dont know if its the last game or not, right?
                    if (data.round.toLocaleUpperCase() == "GRAND FINALS"
                    && !(data.wl[0] == "L" && data.wl[1] == "L")) {
                        fadeIn(superCoolQuestionMark, 1.5, introDelaySc+.5);
                    }

                }
            }
        }

        roundText.textContent = data.round;
        tournamentText.textContent = data.tournamentName;
        
        //round, tournament and VS/GameX text fade in
        fadeIn(textsIntro, fadeInTimeSc, introDelaySc-.2);

        //aaaaand fade out everything
        fadeOut(introDiv, fadeInTimeSc+.2, introDelaySc+1.8);

    }

}

export const scoreboardIntro = new ScoreboardIntro;