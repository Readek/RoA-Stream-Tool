import * as glob from '../Globals.mjs';

export class Finder {

    /** @protected {HTMLElement} finderEl */
    _finderEl;
    /** @protected {HTMLElement} list */
    _list;
    
    constructor(el) {

        this._finderEl = el;
        this._list = el.getElementsByClassName("searchList")[0];

    }

    /**
     * Opens the finder below the element that invoked it
     * @param {HTMLElement} callEl - Element that calls the finder
     * @param {Number} pNum - Currently active player
     */
    open(callEl, pNum = -1) {

        // move the dropdown menu under the selected element
        callEl.appendChild(this._finderEl);

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
     * Filters the finder's content depending on input text
     * @param {HTMLElement} finder - Finder to filter
    */ 
    filterFinder(filterValue) {

        // we want to store the first entry starting with filter value
        let startsWith;

        // for every entry on the list
        const finderEntries = this.getFinderEntries();
        for (let i = 0; i < finderEntries.length; i++) {
            
            // find the name we are looking for
            const entryName = finderEntries[i].getElementsByClassName("pfName")[0].innerHTML;

            // if the name doesnt include the filter value, hide it
            if (entryName.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())) {
                finderEntries[i].style.display = "flex";
            } else {
                finderEntries[i].style.display = "none";
            }

            // if its starts with the value, store its position
            if (entryName.toLocaleLowerCase().startsWith(filterValue.toLocaleLowerCase()) && !startsWith) {
                startsWith = i;
            }

        }

        glob.current.focus = -1;

        // if no value, just remove any remaining active classes
        if (filterValue == "") {
            this.removeActiveClass(this.getFinderEntries());
        } else {
            if (startsWith) glob.current.focus = startsWith - 1;
            this.addActive(true);
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

    /**
     * Adds visual feedback to navigate finder lists with the keyboard
     * @param {Boolean} direction - Up (true) or down (false)
     */
    addActive(direction) {
    
        // this will make our code easier to read
        const entries = this.getFinderEntries();

        // clean up the current active element
        this.removeActiveClass(entries);

        // if true, were going up
        if (direction) {

            // increase that focus
            glob.current.focus++;
            // if end of list, cicle
            if (glob.current.focus >= entries.length) glob.current.focus = 0;

            // search for the next visible entry
            while (glob.current.focus <= entries.length-1) {
                if (entries[glob.current.focus].style.display == "none") {
                    glob.current.focus++;
                } else {
                    break;
                }
            }
            // if we didnt find any, start from 0
            if (glob.current.focus == entries.length) {
                glob.current.focus = 0;
                while (glob.current.focus <= entries.length-1) {
                    if (entries[glob.current.focus].style.display == "none") {
                        glob.current.focus++;
                    } else {
                        break;
                    }
                }
            }
            // if even then we couldnt find a visible entry, set it to invalid
            if (glob.current.focus == entries.length) {
                glob.current.focus = -1;
            }

        } else { // same as above but inverted
            glob.current.focus--;
            if (glob.current.focus < 0) glob.current.focus = (entries.length - 1);
            while (glob.current.focus > -1) {
                if (entries[glob.current.focus].style.display == "none") {
                    glob.current.focus--;
                } else {
                    break;
                }
            }
            if (glob.current.focus == -1) {
                glob.current.focus = entries.length-1;
                while (glob.current.focus > -1) {
                    if (entries[glob.current.focus].style.display == "none") {
                        glob.current.focus--;
                    } else {
                        break;
                    }
                }
            }
            if (glob.current.focus == entries.length) {
                glob.current.focus = -1;
            }
        }

        // if there is a valid entry
        if (glob.current.focus > -1) {
            //add to the selected entry the active class
            entries[glob.current.focus].classList.add("finderEntry-active");
            // make it scroll if it goes out of view
            entries[glob.current.focus].scrollIntoView({block: "center"});
        }
        
    }

    /**
     * Removes visual feedback from a finder list
     * @param {HTMLCollectionOf} entries - All entries from a list
     */
    removeActiveClass(entries) {
        for (let i = 0; i < entries.length; i++) {
            entries[i].classList.remove("finderEntry-active");
        }
    }

}