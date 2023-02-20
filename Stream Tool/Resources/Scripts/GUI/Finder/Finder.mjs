import { current, inside } from "../Globals.mjs";


export class Finder {

    /** @protected {HTMLElement} finderEl */
    _finderEl;
    /** @protected {HTMLElement} list */
    _list;
    
    constructor(el) {
        this._finderEl = el;
        this._list = el.getElementsByClassName("searchList")[0];

        // flags to know if cursor is above the finder
        this._finderEl.addEventListener("mouseenter", () => { inside.finder = true });
        this._finderEl.addEventListener("mouseleave", () => { inside.finder = false });

    }

    /**
     * Opens the finder below the element that invoked it
     * @param {HTMLElement} callEl - Element that calls the finder
     */
    open(callEl) {

        // move the dropdown menu under the selected element
        callEl.appendChild(this._finderEl);

        // set up some global variables for other functions
        current.focus = -1;

        // position the dropdown
        this.positionFinder();

    }

    /** Positions the finder avoiding going out of view */
    positionFinder() {

        // reset the dropdown position
        this._finderEl.style.top = "100%";
        this._finderEl.style.left = "0";

        // get some data to calculate if it goes offscreen
        const selectPos = this._finderEl.parentElement.getBoundingClientRect();
        let finderPos = this._finderEl.getBoundingClientRect();
        // text finders will report their height values as 0
        if (finderPos.height === 0) {
            finderPos = this._finderEl.firstElementChild.getBoundingClientRect();
        }

        // vertical check
        if (selectPos.bottom + finderPos.height > window.innerHeight) {
            this._finderEl.style.top = `calc(100% + ${window.innerHeight - finderPos.bottom - 10}px)`;
            this._finderEl.style.left = "100%";
        }
        // horizontal check
        if (selectPos.left + finderPos.width > window.innerWidth) {
            this._finderEl.style.left = `calc(${window.innerWidth - (selectPos.left + finderPos.width) - 5}px)`;
        }

    }

    /**
     * Scans for all current entries, then returns them
     * @returns {HTMLCollectionOf}
    */
    getFinderEntries() {
        return this._list.getElementsByClassName("finderEntry");
    }

    /**
     * Checks for the current finder's display status
     * @returns {Boolean} - Visible (true) or not (false)
     */
    isVisible() {
        const displayValue = window.getComputedStyle(this._finderEl).getPropertyValue("display");
        return (displayValue == "block" && this.getFinderEntries().length > 0);
    }

    /** I will let you assume what this function does */
    hide() {
        this._finderEl.style.display = "none";
    }

    /**
     * Adds a new entry at the end of the finder list
     * @param {HTMLElement} newEl - Element to append to the list
     */
    addEntry(newEl) {
        this._list.appendChild(newEl);
    }

    /** 
     * Removes all entries on a finder list
     * @protected clearList
     */
    _clearList() {
        this._list.innerHTML = "";
    }

    /**
     * Positions a character image inside a finder entry
     * @param {String} skin - Name of the skin
     * @param {HTMLElement} charEL - Element to be positioned
     * @param {Object} pos - Character position data
     */
    positionCharImg(skin, charEL, pos) {
        //               x, y, scale
        const charPos = [0, 0, 1];
        //now, check if the character and skin exist in the database down there
        if (pos) {
            if (pos.gui[skin]) { //if the skin has a specific position
                charPos[0] = pos.gui[skin].x;
                charPos[1] = pos.gui[skin].y;
                charPos[2] = pos.gui[skin].scale;
            } else { //if none of the above, use a default position
                charPos[0] = pos.gui.neutral.x;
                charPos[1] = pos.gui.neutral.y;
                charPos[2] = pos.gui.neutral.scale;
            }
        } else { //if the character isnt on the database, set positions for the "?" image
            charPos[0] = 0;
            charPos[1] = 0;
            charPos[2] = 1.2;
        }
    
        //to position the character
        charEL.style.transform = `
            translate(${charPos[0]}px, ${charPos[1]}px)
            scale(${charPos[2]})
        `;
    
    }

    /**
     * Adds visual feedback to navigate finder lists with the keyboard
     * @param {Boolean} direction - Up (true) or down (false)
     */
    addActive(direction) {
    
        // this will make our code easier to read
        const entries = this.getFinderEntries();

        // clean up the current active element
        this._removeActiveClass(entries);

        // if true, were going up
        if (direction) {

            // increase that focus
            current.focus++;
            // if end of list, cicle
            if (current.focus >= entries.length) current.focus = 0;

            // search for the next visible entry
            while (current.focus <= entries.length-1) {
                if (entries[current.focus].style.display == "none") {
                    current.focus++;
                } else {
                    break;
                }
            }
            // if we didnt find any, start from 0
            if (current.focus == entries.length) {
                current.focus = 0;
                while (current.focus <= entries.length-1) {
                    if (entries[current.focus].style.display == "none") {
                        current.focus++;
                    } else {
                        break;
                    }
                }
            }
            // if even then we couldnt find a visible entry, set it to invalid
            if (current.focus == entries.length) {
                current.focus = -1;
            }

        } else { // same as above but inverted
            current.focus--;
            if (current.focus < 0) current.focus = (entries.length - 1);
            while (current.focus > -1) {
                if (entries[current.focus].style.display == "none") {
                    current.focus--;
                } else {
                    break;
                }
            }
            if (current.focus == -1) {
                current.focus = entries.length-1;
                while (current.focus > -1) {
                    if (entries[current.focus].style.display == "none") {
                        current.focus--;
                    } else {
                        break;
                    }
                }
            }
            if (current.focus == entries.length) {
                current.focus = -1;
            }
        }

        // if there is a valid entry
        if (current.focus > -1) {
            //add to the selected entry the active class
            entries[current.focus].classList.add("finderEntry-active");
            // make it scroll if it goes out of view
            entries[current.focus].scrollIntoView({block: "center"});
        }
        
    }

    /**
     * Removes visual feedback from a finder list
     * @param {HTMLCollectionOf} entries - All entries from a list
     * @protected removeActiveClass
     */
    _removeActiveClass(entries) {
        for (let i = 0; i < entries.length; i++) {
            entries[i].classList.remove("finderEntry-active");
        }
    }

}