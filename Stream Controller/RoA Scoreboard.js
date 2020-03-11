window.onload = init;

function init() {
	var xhr = new XMLHttpRequest();
	var scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	var scObj;
	var startup = true;
	var cBust = 0;

	//max text sizes (used when resizing back)
	var nameSize = '30px';
	var roundSize = '19px';

	//animation stuff
	var pMove = 50;
	var pCharMove = 20;

	var fadeInTime = .3;
	var fadeOutTime = .2;
	var nameDelay = .8;

	//to resize the texts if they are too large
	var p1Wrap = $('#p1Wrapper'); 
	var p2Wrap = $('#p2Wrapper');
	var rdResize = $('#round');

	//to avoid the code constantly running the same method over and over
	var p1CharacterPrev;
	var p1SkinPrev;
	var p1ScorePrev;
	var p1ColorPrev;
	var p1wlPrev;

	var p2CharacterPrev;
	var p2SkinPrev;
	var p2ScorePrev;
	var p2ColorPrev;
	var p2wlPrev;

	var bestOfPrev;

	xhr.overrideMimeType('application/json');

	function getInfo() {
		xhr.open('GET', scoreboardInfo + '?v=' + cBust, true);
		xhr.send();
		cBust++;
	}

	getInfo();
	setInterval(function () { getInfo(); }, 500); //update interval

	xhr.onreadystatechange = parseJSON;

	function parseJSON() {
		if (xhr.readyState === 4) {
			scObj = JSON.parse(xhr.responseText);
			scoreboard();
		}
	}
	
	function scoreboard() {
		if (startup) {
			getData();
			startup = false;
		}
		else {
			getData();
		}
	}

	function getData() {
		var p1Name = scObj['p1Name'];
		var p1Team = scObj['p1Team'];
		var p1Score = scObj['p1Score'];
		var p1Color = scObj['p1Color'];
		var p1Character = scObj['p1Character'];
		var p1Skin = scObj['p1Skin'];
		var p1WL = scObj['p1WL'];
		
		var p2Name = scObj['p2Name'];
		var p2Team = scObj['p2Team'];
		var p2Score = scObj['p2Score'];
		var p2Color = scObj['p2Color'];
		var p2Character = scObj['p2Character'];
		var p2Skin = scObj['p2Skin'];
		var p2WL = scObj['p2WL'];

		var round = scObj['round'];
		var bestOf = scObj['bestOf'];
		var allowIntro = scObj['allowIntro'];


		//first, things that will always happen		

		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			$('#borderP1').attr('src', 'Resources/Overlay/Border ' + bestOf + '.png');
			$('#borderP2').attr('src', 'Resources/Overlay/Border ' + bestOf + '.png');
			//update the score ticks so they fit the bestOf border
			updateScore('#p1Score', p1Score, bestOf);
			updateScore('#p2Score', p2Score, bestOf);
			bestOfPrev = bestOf;
		}
		//change the player background colors
		if (p1ColorPrev != p1Color) {
			$('#p1Color').attr('src', 'Resources/Overlay/Colors/' + p1Color + '.png');
			p1ColorPrev = p1Color;
		}
		if (p2ColorPrev != p2Color) {
			$('#p2Color').attr('src', 'Resources/Overlay/Colors/' + p2Color + '.png');
			p2ColorPrev = p2Color;
		}
		

		//now, things that will happen the first time the html loads
		if (startup) {
			//the intro vid! WIP WIP WIP
			if (allowIntro == "yes") {
				setTimeout(() => { 
					$('#scoreboardVid').attr('src', 'Resources/Trails/Absa/LoA Blue.webm');
					document.getElementById('scoreboardVid').play();
				 }, 0);				
			}

			//starting with player 1 first
			//set the texts
			$('#p1Name').html(p1Name);
			$('#p1Team').html(p1Team);
			//resize the text so it doesnt get out of the overlay if its too long
			resizeText(p1Wrap);
			//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
			gsap.fromTo("#p1Wrapper", 
				{x: -pMove}, //from
				{delay: nameDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

			//set the character image for the player
			updateChar('#p1Character', p1Character, p1Skin);
			//check the position of the character that the player is using rn, and position it
			checkPosChar(p1Character, p1Skin, '#p1Character');
			//set starting position for the character icon, then fade-in-move the character icon to the overlay
			gsap.fromTo("#p1Character",
				{x: -pCharMove},
				{delay: nameDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			//save the character/skin so we run the character change code only when this doesnt equal to the next
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;

			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(p1WL, "1");
			gsap.fromTo("#wlP1",
				{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
				{delay: nameDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
			//save for later so the animation doesn't repeat over and over
			p1wlPrev = p1WL;

			//score check, we updated score earlier so we will just set the prevs
			p1ScorePrev = p1Score;


			//took notes from player 1? well, this is exactly the same!
			$('#p2Name').html(p2Name);
			$('#p2Team').html(p2Team);
			resizeText(p2Wrap);
			gsap.fromTo("#p2Wrapper", 
				{x: pMove},
				{delay: nameDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

			updateChar('#p2Character', p2Character, p2Skin);
			checkPosChar(p2Character, p2Skin, '#p2Character');
			gsap.fromTo("#p2Character",
				{x: -pCharMove},
				{delay: nameDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			updateWL(p2WL, "2");
			gsap.fromTo("#wlP2",
				{y: -pMove},
				{delay: nameDelay+.5, y: 0, ease: "power2.out", duration: .5});
			p2wlPrev = p2WL;

			p2ScorePrev = p2Score;

			//WIP WIP WIP
			$('#teamLogoP1').attr('src', 'Resources/TeamLogos/' + p1Team + '.png').on("error",function () {
				$('#teamLogoP1').attr('src', 'Resources/Literally Nothing.png');
			});

			$('#teamLogoP2').attr('src', 'Resources/TeamLogos/' + p2Team + '.png').on("error",function () {
				$('#teamLogoP2').attr('src', 'Resources/Literally Nothing.png');
			});

			//update the round text
			$('#round').html(round);
			//and of course, resize the round text if it overflows
			resizeText(rdResize);
		}

		//now things that will happen not the first time
		else {
			//player 1 (this is mostly like above's code)
			if ($('#p1Name').text() != p1Name || $('#p1Team').text() != p1Team) {
				//move and fade out the player 1's text
				gsap.to("#p1Wrapper", {x: -pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pNameMoved});
				function pNameMoved() { //this gets called when the previous animation ends
					//now that nobody is seeing it, quick, change the text's content!
					$('#p1Wrapper').css('font-size',nameSize);
					$('#p1Name').html(p1Name);
					$('#p1Team').html(p1Team);
					//resize the text if its too big
					resizeText(p1Wrap);
					//and finally, fade the name back in with a sick movement
					gsap.to("#p1Wrapper", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}

			//player 1's character icon change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {
				//fade out the image while also moving it because that always looks cool
				gsap.to("#p1Character", {x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pCharMoved});
				function pCharMoved() {
					//now that nobody can see this, lets change the image!
					updateChar('#p1Character', p1Character, p1Skin);
					//position the next character
					var charScale = checkPosChar(p1Character, p1Skin, '#p1Character'); //will return scale if asked
					//and now, fade in and move back
					gsap.fromTo("#p1Character",
						{scale: charScale}, //set scale keyframe so it doesnt scale while fading back
						{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); 
				}
				p1CharacterPrev = p1Character;
				p1SkinPrev = p1Skin;
			}

			//the [W] and [L] status for grand finals
			if (p1wlPrev != p1WL) {
				//move it away!
				gsap.to("#wlP1", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
				function pwlMoved() {
					//change the thing!
					updateWL(p1WL, "1");
					//move it back!
					gsap.to("#wlP1", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p1wlPrev = p1WL;
			}

			//score check
			if (p1ScorePrev != p1Score) {
				//this time we will play a sexy animation so everyone can se when the score changes
				$('#p1scoreUp').attr('src', 'Resources/Overlay/Score/ScoreUp ' + bestOf + '/' + p1Color + '.webm');
				document.getElementById('p1scoreUp').play();
				//set timeout to the actual image change so it fits with the animation
				setTimeout(() => {updateScore('#p1Score', p1Score, bestOf)}, 200);
				p1ScorePrev = p1Score;
			}			

			//WIP WIP WIP
			if ($('#p1Team').text() != p1Team) {
				$('#teamLogoP1').attr('src', 'Resources/TeamLogos/' + p1Team + '.png').on("error",function () {
					$('#teamLogoP1').attr('src', 'Resources/Literally Nothing.png');
				});
			}

			//did you pay attention earlier? Well, this is the same as player 1!
			if($('#p2Name').text() != p2Name || $('#p2Team').text() != p2Team){
				gsap.to("#p2Wrapper", {x: pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pNameMoved});
				function pNameMoved() {
					$('#p2Wrapper').css('font-size',nameSize);
					$('#p2Name').html(p2Name);
					$('#p2Team').html(p2Team);
					resizeText(p2Wrap);
					gsap.to("#p2Wrapper", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}

			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				gsap.to("#p2Character", {x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pCharMoved});
				function pCharMoved() {
					updateChar('#p2Character', p2Character, p2Skin);
					var charScale = checkPosChar(p2Character, p2Skin, '#p2Character');
					gsap.fromTo("#p2Character",
						{scale: charScale},
						{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); 
				}
				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}

			if (p2wlPrev != p2WL) {
				gsap.to("#wlP2", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
				function pwlMoved() {
					updateWL(p2WL, "2");
					gsap.to("#wlP2", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p2wlPrev = p2WL;
			}

			if (p2ScorePrev != p2Score) {
				$('#p2scoreUp').attr('src', 'Resources/Overlay/Score/ScoreUp ' + bestOf + '/' + p2Color + '.webm');
				document.getElementById('p2scoreUp').play();
				setTimeout(() => {updateScore('#p2Score', p2Score, bestOf)}, 200);	
				p2ScorePrev = p2Score;
			}

			//WIP WIP WIP
			if ($('#p2Team').text() != p2Team) {
				$('#teamLogoP2').attr('src', 'Resources/TeamLogos/' + p2Team + '.png').on("error",function () {
					$('#teamLogoP2').attr('src', 'Resources/Literally Nothing.png');
				});
			}
			
			//and finally, update the round text
			if ($('#round').text() != round){
				gsap.to("#round", {opacity: 0, duration: fadeOutTime, onComplete: roundMoved});
				function roundMoved() {
					$('#round').css('font-size',roundSize);
					$('#round').html(round);					
					resizeText(rdResize);
					gsap.to("#round", {delay: .2, opacity: 1, duration: fadeInTime});
				}
			}
		}
	}

	//image change
	function updateChar(charID, pCharacter, pSkin) {
		//change the image path depending on the character and skin
		$(charID).attr('src', 'Resources/Characters/' + pCharacter + '/' + pSkin + '.png').on("error",function () {
			$(charID).attr('src', 'Resources/Literally Nothing.png') //safety check if the img is not found
		});
	}

	//score change
	function updateScore(scoreID, pScore, bestOf) {
		//change the image depending on the bestOf status and, of course, the current score
		$(scoreID).attr('src', 'Resources/Overlay/Score/Win Tick ' + bestOf + ' ' + pScore + '.png').on("error",function () {
			$(scoreID).attr('src', 'Resources/Literally Nothing.png') //if the score is 3, nothing is shown
		});
	}

	//check if winning or losing in a GF, then change image
	function updateWL(pWL, playerNum) {
		if (pWL == "W") {
			$('#wlP' + playerNum).attr('src', 'Resources/Overlay/Winners P' + playerNum + '.png');
		} else if (pWL == "L") {
			$('#wlP' + playerNum).attr('src', 'Resources/Overlay/Losers P' + playerNum + '.png');
		} else {
			$('#wlP' + playerNum).attr('src', 'Resources/Literally Nothing.png');
		}
	}

	//text resize (not fancy i know), keeps making the text smaller until it fits
	function resizeText(text) {
		text.each(function(i, text) {
			while (text.scrollWidth > text.offsetWidth || text.scrollHeight > text.offsetHeight) {
				var newFontSize = (parseFloat($(text).css('font-size').slice(0,-2)) * .95) + 'px';
				$(text).css('font-size', newFontSize);
			};
		});
	}

	//positions database starts here!
	Absa = {
		neutral: [5, 19.4, 4.7],
		LoA: [34, 23, 5.75]
	};
	Clairen = {
		neutral: [-23, 30, 4.5],
		LoA: [31, 28, 4.8]
	};
	Elliana = {
		neutral: [-14, 25, 4],
		LoA: [-19, 22, 3.9]
	};
	Etalus = {
		neutral: [-22, 24, 3.4],
		LoA: [19, 34, 5]
	};
	Forsburn = {
		neutral: [-24, 13, 4.5],
		LoA: [7, 23, 5.8]
	};
	Kragg = {
		neutral: [-7, 7, 3.4],
		LoA: [-8, 2, 4]
	};
	Maypul = {
		neutral: [-7, 30, 3.5],
		LoA: [25, 29, 5],
		Ragnir: [-24, -3, 3]
	};
	Orcane = {
		neutral: [-22, 15, 3],
		LoA: [-14, 20, 3.2]
	};
	OriandSein = { //characters with spaces on their name must have them removed
		neutral: [-4, 8, 2.8]
	};
	Ranno = {
		neutral: [13, 22, 5],
		LoA: [25, 39, 4.7]
	};
	ShovelKnight = {
		neutral: [-0, 18, 3.2]
	};
	Sylvanos = {
		neutral: [-27, 7, 3.5],
		LoA: [10, 25.8, 6.3]
	};
	Wrastor = {
		neutral: [-12, 28, 4.7],
		LoA: [28, 30, 6]
	};
	Zetterburn = {
		neutral: [-7, 4, 4.1],
		LoA: [18, 23, 6.1]
	};

	//workshop characters:
	Astra = {
		neutral: [25, 18, 3.2]
	};
	Epinel = {
		neutral: [22, 30, 4]
	};
	Falco = {
		neutral: [15, 33, 3.8]
	};
	Fox = {
		neutral: [15, 26, 3.8]
	};
	HimeDaisho = {
		neutral: [22, 13, 4.5]
	};
	Kirby = {
		neutral: [12, 16, 2]
	};
	Kris = {
		neutral: [20, 26, 4.2]
	};
	MayuAshikaga = {
		neutral: [3, 22, 5],
		alt: [8, 10, 2.5]
	};
	Mollo = {
		neutral: [-2, 20, 4.4]
	};
	Mycolich = {
		neutral: [-2, 11, 3.8]
	};
	Olympia = {
		neutral: [19, 20, 4.5]
	};
	Pomme = {
		neutral: [30, 22, 4]
	};
	R_00 = { //this should have "-" but it would break :(
		neutral: [-8, 20, 3.8]
	};
	TrummelandAlto = {
		neutral: [10, 30, 2.5],
		alt: [27, -7, 2.5]
	};
	Valkyrie = {
		neutral: [-2, -9, 3.5]
	};
	Yoyo = {
		neutral: [14, 22, 3]
	};
	ZettaAshikaga = {
		neutral: [-7, 23, 6],
		alt: [-15, 5, 2.7]
	};

	//this will be called whenever we want to position a character from above
	function checkPosChar(pCharacter, pSkin, charID) {
		//this is so characters with spaces on their names also work
		var pCharNoSpaces = pCharacter.replace(/ /g, "");
		//             x, y, scale
		var charPos = [0, 0, 1];
		//now, check if the character and skin exist in the database up there
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) { //if the skin has a specific position
				charPos[0] = window[pCharNoSpaces][pSkin][0];
				charPos[1] = window[pCharNoSpaces][pSkin][1];
				charPos[2] = window[pCharNoSpaces][pSkin][2];
			} else if (pSkin.includes("Alt ")) { //for a group of imgs that have a specific position
				charPos[0] = window[pCharNoSpaces].alt[0];
				charPos[1] = window[pCharNoSpaces].alt[1];
				charPos[2] = window[pCharNoSpaces].alt[2];
			} else { //if none of the above, use a default position
				charPos[0] = window[pCharNoSpaces].neutral[0];
				charPos[1] = window[pCharNoSpaces].neutral[1];
				charPos[2] = window[pCharNoSpaces].neutral[2];
			}
		}
		//to position the character
		$(charID).css('object-position', charPos[0] + "px " + charPos[1] + "px");
		$(charID).css('transform', "scale(" + charPos[2] + ")");
		return charPos[2]; //we need this one to set scale keyframe when fading back
	}
}