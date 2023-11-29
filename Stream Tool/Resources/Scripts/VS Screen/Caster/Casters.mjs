import { current } from "../../Utils/Globals.mjs";
import { genRnd } from "../../Utils/Gen Random Num.mjs"
import { Caster } from "./Caster.mjs";
import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "../VsGlobals.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";

const castersDiv = document.getElementById("casterInfo");

const maxSocials = [];
const socialInterval = 7000; // time in miliseconds for each change

let socialTurn = 0;
let currentSocial = "";

class Casters {

    /** @type {Caster[]} */
    #casters = [];


    initCasters(socialNames) {

        // pronouns are kinda their own thing
        maxSocials.push("pronouns");

        // get current possible socials and store them
        for (let i = 0; i < socialNames.length; i++) {
            maxSocials.push(socialNames[i]);
            
        }

        // lets get rolling
        this.#initCarrousel();

    }


    /** Adds in a new commentator */
    #createCaster() {

        this.#casters.push(new Caster);

    }

    /** Removes the last commentator from the array */
    #deletCaster() {
        
        this.#casters.at(-1).delet();
        this.#casters.splice(this.#casters.length-1);

    }

    /**
     * Updates commentators with the provided data
     * @param {Object} data - New data with all commentators
     */
    async update(data) {

        // fist of all, check if we have the same amount of casters
        const incCasterLength = data.length;
        const homeCasterLength = this.#casters.length;

        if (incCasterLength != homeCasterLength) {

            // hide displayed info so nobody can see
            if (!current.startup) { // skip if loading up
                await fadeOut(castersDiv.firstElementChild, fadeOutTimeVs);
            }

            if (this.#casters.length < data.length) {
        
                // if more casters than previously, add that many casters
                for (let i = 0; i < incCasterLength - homeCasterLength; i++) {
                    this.#createCaster();
                }
    
            } else {
    
                // if less casters than previously, remove that many casters
                for (let i = 0; i < homeCasterLength - incCasterLength; i++) {
                    this.#deletCaster();
                }
    
            }

            // resize the commentator container
            this.#resizeDiv();
            // and show it all back again
            fadeIn(castersDiv.firstElementChild, fadeInTimeVs, .3);


        }
        
        // in case we are waiting for animations, store promises here
        const allReady = []

        // for each commentator
        for (let i = 0; i < data.length; i++) {
           
            // check if the we have is different than the new one
            if (this.#casters[i].getName() != data[i].name
                || this.#casters[i].getTag() != data[i].tag) {

                // if we arent loading the view up, wait for fade out
                if (!current.startup) {
                    allReady.push(this.#casters[i].fadeOutName().then(() => {
                        this.#casters[i].setName(data[i].name);
                        this.#casters[i].setTag(data[i].tag);
                        this.#casters[i].fadeInName();
                    }))
                } else {
                    this.#casters[i].setName(data[i].name);
                    this.#casters[i].setTag(data[i].tag);
                    this.#casters[i].fadeInName();
                }
            
            };

            // same with pronouns and socials
            if (this.#casters[i].haveSocialsChanged(data[i])) {

                if (!current.startup) {
                    allReady.push(this.#casters[i].fadeOutSocials().then(() => {
                        this.#casters[i].setSocials(data[i]);
                        this.#casters[i].updateSocialText(currentSocial);
                        this.#casters[i].updateSocialIcon(currentSocial);
                        this.#casters[i].fadeInSocials();
                    }))
                } else {
                    this.#casters[i].setSocials(data[i]);
                    this.#casters[i].updateSocialText(currentSocial);
                    this.#casters[i].updateSocialIcon(currentSocial);
                    this.#casters[i].fadeInSocials();
                }

                this.#rotateSocials();
                
            }

        }

        // this will wait for all fade out animations
        Promise.all(allReady).then(() =>  {
            this.#checkEmpty();
        })

    }

    /** Initializes socials fading out and in on an interval */
    #initCarrousel() {

        // generate a random beginning point
        socialTurn = genRnd(0, maxSocials.length - 1);
        currentSocial = maxSocials[socialTurn];
        
        // every x seconds
        setInterval(() => {
            
            this.#rotateSocials();

        }, socialInterval);

    }

    #rotateSocials() {

        socialTurn++;
            
        // dont go out of bounds
        if (socialTurn >= maxSocials.length) {
            socialTurn = 0;
        }

        // set the new text
        currentSocial = maxSocials[socialTurn];
        let socialsFound;

        // if no one has next social, dont display it
        let antiLoopCounter = 0;
        while (!socialsFound && antiLoopCounter < maxSocials.length-1) {

            let someHaveSocial;

            // check if casters have current social
            for (let i = 0; i < this.#casters.length; i++) {
                if (this.#casters[i].hasSocial(currentSocial)) {
                    socialsFound = true;
                    someHaveSocial = true;
                    break;
                }
            }

            // if nothing found, we just proceed to the next one
            if (!someHaveSocial) {
                socialTurn++;
                if (socialTurn >= maxSocials.length) {
                    socialTurn = 0;
                }
                currentSocial = maxSocials[socialTurn];
            }
            
            antiLoopCounter++;

        }

        // and update shown text
        for (let i = 0; i < this.#casters.length && socialsFound; i++) {
            this.#casters[i].fadeOutSocials().then(() => {
                this.#casters[i].updateSocialText(currentSocial);
                this.#casters[i].updateSocialIcon(currentSocial);
                this.#casters[i].fadeInSocials();
            })
            
        }

    }

    /** Resizes the commentators div with a smooth transition */
    #resizeDiv() {

        // dirty tricks to gather data
        const prevWidth = window.getComputedStyle(castersDiv).width;
        castersDiv.style.width = "auto";
        const nextWidth = window.getComputedStyle(castersDiv).width;
        castersDiv.style.width = prevWidth;
        
        // now we need to do this on the next tick or else transition wont trigger
        castersDiv.offsetWidth; // force finish css calcs
        castersDiv.style.width = nextWidth;

    }

    /** Fades in or out the entire commentator div if empty or not */
    #checkEmpty() {

        let notEmpty;

        for (let i = 0; i < this.#casters.length; i++) {
            if (this.#casters[i].isNotEmpty()) {
                notEmpty = true;
            }            
        }

        if (notEmpty) {
            castersDiv.style.height = "76px";
            castersDiv.style.borderWidth = "9px 54px";
            fadeIn(castersDiv, fadeInTimeVs);
        } else {
            castersDiv.style.height = "0px";
            castersDiv.style.borderWidth = "0px";
            fadeOut(castersDiv, fadeOutTimeVs);
        }

    }

    /**
     * Changes behaviour to adapt to requested gamemode
     * @param {Number} gamemode - Current gamemode
     */
    changeGamemode(gamemode) {

        if (gamemode == 2) { // doubles
            
            castersDiv.classList.remove("casterInfoSingles");
            castersDiv.classList.add("casterInfoDoubles");

        } else { // singles
            
            castersDiv.classList.add("casterInfoSingles");
            castersDiv.classList.remove("casterInfoDoubles");

        }

    }

}

export const casters = new Casters;