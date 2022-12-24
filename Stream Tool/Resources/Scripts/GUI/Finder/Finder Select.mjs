import { Finder } from "./Finder.mjs";

export class FinderSelect extends Finder {

    constructor(el) {

        super(el);

        this._filterInp = this._finderEl.getElementsByClassName("listSearch")[0];

        // filter the finder list as we type
        this._finderEl.addEventListener("input", () => {this.filterFinder(this.getFilterText())});

    }

    /** Focus the search input field and reset the list */
    focusFilter() {
        this._finderEl.firstElementChild.value = "";
        this._finderEl.firstElementChild.focus();
        this.filterFinder(this.getFilterText());
    }

    /**
     * Returns the current text from the "Type to filter" input
     * @returns {String} Them text
     */
    getFilterText() {
        return this._filterInp.value;
    }

}