import { filterFinder } from './Filter Finder.mjs';
import * as glob from '../Globals.mjs';

export class Finder {

    /** @protected {HTMLElement} finderEl */
    _finderEl;
    
    constructor(el) {

        this._finderEl = el;
        this._list = el.getElementsByClassName("searchList")[0];
    
        // filter the finder list as we type
        el.addEventListener("input", () => {filterFinder(this._finderEl)});

    }

    /**
     * Opens the finder below the element that invoked it
     * @param {HTMLElement} callEl - Element that calls the finder
     * @param {Number} pNum - Currently active player
     */
    open(callEl, pNum = -1) {

        // move the dropdown menu under the selected element
        callEl.appendChild(this._finderEl);

        // focus the search input field and reset the list
        this._finderEl.firstElementChild.value = "";
        this._finderEl.firstElementChild.focus();
        filterFinder(this._finderEl);

        // set up some global variables for other functions
        glob.current.player = pNum;
        glob.current.focus = -1;

        // reset the dropdown position
        this._finderEl.style.top = "100%";
        this._finderEl.style.left = "0";

        // get some data to calculate if it goes offscreen
        const finderPos = this._finderEl.getBoundingClientRect();
        const selectPos = this._finderEl.parentElement.getBoundingClientRect();

        // vertical check
        if (selectPos.bottom + finderPos.height > window.innerHeight) {
            this._finderEl.style.top = `calc(100% + ${window.innerHeight - finderPos.bottom - 10}px)`;
            this._finderEl.style.left = "100%";
        }
        // horizontal check
        /* if (selectPos.right + finderPos.width > window.innerWidth) {
            this._finderEl.style.left = `calc(100% + ${window.innerWidth + finderPos.right + 5}px)`;
        } */

    }

    /**
     * Scans for all current entries, then returns them
     * @returns {HTMLCollectionOf}
    */
    getFinderEntries() {
        return this._finderEl.getElementsByClassName("finderEntry");
    }

    /**
     * Checks for the current finder's display status
     * @returns {Boolean} - Visible (true) or not (false)
     */
    isVisible() {
        const displayValue = window.getComputedStyle(this._finderEl).getPropertyValue("display");
        return displayValue == "block";
    }

    /**
     * Adds a new entry at the end of the finder list
     * @param {HTMLElement} newEl - Element to append to the list
     */
    addEntry(newEl) {
        this._list.appendChild(newEl);
    }

    /** Removes all entries on a finder list */
    clearList() {
        this._list.innerHTML = "";
    }

}