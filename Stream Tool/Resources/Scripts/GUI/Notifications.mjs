const notifDiv = document.getElementById("notifDiv");

/**
 * Displays a notification on screen
 * @param {String} text - Text to be shown
 */
export function displayNotif(text) {

    // create the element and give it some style
    const newDiv = document.createElement("div");
    newDiv.classList.add("notifText");
    
    // give it that text
    newDiv.innerHTML = text;

    // add it to the notification area
    notifDiv.appendChild(newDiv);

    // when the animation finishes, kill the element
    newDiv.addEventListener("animationend", killNotif);

}

function killNotif() {
    
    notifDiv.removeChild(this);

}