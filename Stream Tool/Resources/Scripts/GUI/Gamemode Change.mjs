import { hideBgCharImgs, showBgCharImgs } from "./Player/BG Char Image.mjs";
import { players } from "./Player/Players.mjs";
import { teams } from "./Team/Teams.mjs";
import { wl } from "./WinnersLosers.mjs";

class Gamemode {

    // store 2v2 only elements
    #dubEls = document.getElementsByClassName("elGm2");
    #gmButt = document.getElementById("gamemode");
    #gamemode = 1;

    constructor() {
        this.#gmButt.addEventListener("click", () => {
            const value = this.#gamemode == 1 ? 2 : 1;
            this.changeGamemode(value);
        });
    }

    getGm() {
        return this.#gamemode;
    }

    /** Changes the gamemode (1v1 or 2v2) */
    changeGamemode(value) {

        // things are about to get messy
        if (value == 2) {
            
            this.#gamemode = 2;

            // change gamemode selector text
            this.#gmButt.innerText = "2v2";

            // display all 2v2 only elements
            this.#changeDubElsDisplay("flex");

            // hide the background character image to reduce clutter
            hideBgCharImgs();

            for (let i = 1; i < 3; i++) {

                document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wl.getWLButtons()[i-1]);
                document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
                
                document.getElementById("scoreText"+i).style.display = "none";

                document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", teams[i-1].getNameInp());

                document.getElementById('row2-'+i).insertAdjacentElement("beforeend", players[i-1].pInfoDiv);
            
            }

            // change max width to the name inputs and char selects
            for (let i = 0; i < players.length; i++) {

                players[i].nameInp.style.maxWidth = "94px";
                players[i].charSel.style.maxWidth = "73px";
                players[i].skinSel.style.maxWidth = "72px";

            }

            //change the hover tooltip
            this.#gmButt.setAttribute('title', "Change the gamemode to Singles");

            // dropdown menus for the right side will now be positioned to the right
            document.getElementById("dropdownColorR").style.right = "0px";
            document.getElementById("dropdownColorR").style.left = "";

        } else if (value == 1) {

            this.#gamemode = 1;

            // change gamemode selector text
            this.#gmButt.innerText = "1v1";

            // hide all 2v2 only elements
            this.#changeDubElsDisplay("none");

            showBgCharImgs();

            //move everything back to normal
            for (let i = 1; i < 3; i++) {

                document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wl.getWLButtons()[i-1]);
                document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
                
                document.getElementById("scoreText"+i).style.display = "block";
            
                document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", players[i-1].pInfoDiv)
            
            }

            for (let i = 0; i < players.length; i++) {

                players[i].nameInp.style.maxWidth = "210px";
                players[i].charSel.style.maxWidth = "141px";
                players[i].skinSel.style.maxWidth = "141px";
                
            }

            this.#gmButt.setAttribute('title', "Change the gamemode to Doubles");

            //dropdown menus for the right side will now be positioned to the left
            document.getElementById("dropdownColorR").style.right = "";
            document.getElementById("dropdownColorR").style.left = "0px";

        }

    }

    /** Simply changes the display value for all 2v2 only elements */
    #changeDubElsDisplay(display) {
        for (let i = 0; i < this.#dubEls.length; i++) {
            this.#dubEls[i].style.display = display;
        }
    }

}

export const gamemode = new Gamemode;