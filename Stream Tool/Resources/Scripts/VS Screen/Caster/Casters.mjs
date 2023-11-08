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


    /** Adds in a new commentator */
    createCaster() {

        this.#casters.push(new Caster);

    }

    /**
     * Updates commentators with the provided data
     * @param {Object} data - New data with all commentators
     */
    updateCasters(data) {


        // if loading up stuff
        if (current.startup) {

            // pronouns are kinda their own thing
            maxSocials.push("pronouns");

            // get current possible socials and store them
            for (const social in data[0].socials) {
                maxSocials.push(social);
            }

            // with that info, lets get rolling
            this.#initCarrousel();

        }

        // in case we are waiting for animations, store promises here
        const allReady = []

        // for each commentator
        for (let i = 0; i < data.length; i++) {
           
            // check if the we have is different than the new one
            if (this.#casters[i].getName() != data[i].name) {

                // if we arent loading the view up, wait for fade out
                if (!current.startup) {
                    allReady.push(this.#casters[i].fadeOutName().then(() => {
                        this.#casters[i].setName(data[i].name);
                        this.#casters[i].fadeInName();
                    }))
                } else {
                    this.#casters[i].setName(data[i].name);
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

        }, socialInterval);

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
            fadeIn(castersDiv, fadeInTimeVs);
        } else {
            fadeOut(castersDiv, fadeOutTimeVs);
        }

    }

}

export const casters = new Casters;