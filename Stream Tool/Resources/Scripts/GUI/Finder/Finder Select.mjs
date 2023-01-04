import { current } from "../Globals.mjs";
import { Finder } from "./Finder.mjs";

export class FinderSelect extends Finder {

    constructor(el) {

        super(el);

        /** @protected {HTMLElement} filterInp */
        this._filterInp = this._finderEl.getElementsByClassName("listSearch")[0];

        // filter the finder list as we type
        this._finderEl.addEventListener("input", () => {this._filterFinder(this._getFilterText())});

    }

    /**
     * Filters the finder's content depending on input text
     * @param {HTMLElement} finder - Finder to filter
     * @protected _filterFinder
    */ 
    _filterFinder(filterValue) {

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

        current.focus = -1;

        // if no value, just remove any remaining active classes
        if (filterValue == "") {
            this._removeActiveClass(this.getFinderEntries());
        } else {
            if (startsWith) current.focus = startsWith - 1;
            this.addActive(true);
        }

    }

    /** Focus the search input field and reset the list */
    focusFilter() {
        this._finderEl.firstElementChild.value = "";
        this._finderEl.firstElementChild.focus();
        this._filterFinder(this._getFilterText());
    }

    /**
     * Returns the current text from the "Type to filter" input
     * @returns {String} Them text
     * @protected getFilterText
     */
    _getFilterText() {
        return this._filterInp.value;
    }

}