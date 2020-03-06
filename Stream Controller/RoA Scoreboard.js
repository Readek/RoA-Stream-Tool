window.onload = init;

function init() {
	var xhr = new XMLHttpRequest();
	var scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	var scObj;
	var startup = true;
	var cBust = 0;

	//text sizes
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
	var p1ColorPrev;
	var p1wlPrev;

	var p2CharacterPrev;
	var p2SkinPrev;
	var p2ColorPrev;
	var p2wlPrev;

	var bestOfPrev;

	//this will be used to position the character images on the overlay
	var charaPosX;
	var charaPosY;
	var charaScale;

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
		if (startup == true) {
			getData();
			startup = false;
		}
		else {
			getData();
		}
		
	}
	//if you want to set the scoreboard to start late (for screen transitions), you can do so here
	setTimeout(scoreboard, 0); //miliseconds

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

		//determine the score and change border depending of the Best Of status
		//the score ticks actually hide the scores so the logic is reversed
		if (bestOf == "Bo5") {
			//player 1 score
			switch (p1Score) {
				case "0":
					$('#p1Score').attr('src', 'Resources/Overlay/Win Tick Bo5 3.png');
					break;
				case "1":
					$('#p1Score').attr('src', 'Resources/Overlay/Win Tick Bo5 2.png');
					break;
				case "2":
					$('#p1Score').attr('src', 'Resources/Overlay/Win Tick Bo5 1.png');
					break
				default:
					$('#p1Score').attr('src', 'Resources/Literally Nothing.png');
					break;
			}

			//player 2 score
			switch (p2Score) {
				case "0":
					$('#p2Score').attr('src', 'Resources/Overlay/Win Tick Bo5 3.png');
					break;
				case "1":
					$('#p2Score').attr('src', 'Resources/Overlay/Win Tick Bo5 2.png');
					break;
				case "2":
					$('#p2Score').attr('src', 'Resources/Overlay/Win Tick Bo5 1.png');
					break
				default:
					$('#p2Score').attr('src', 'Resources/Literally Nothing.png');
					break;
			}

			//border to fit the score ticks
			if (bestOfPrev != bestOf) {
				$('#borderP1').attr('src', 'Resources/Overlay/Border Bo5.png');
				$('#borderP2').attr('src', 'Resources/Overlay/Border Bo5.png');
				bestOfPrev = bestOf;
			}
		} else {
			//player 1 score
			switch (p1Score) {
				case "0":
					$('#p1Score').attr('src', 'Resources/Overlay/Win Tick Bo3 2.png');
					break;
				case "1":
					$('#p1Score').attr('src', 'Resources/Overlay/Win Tick Bo3 1.png');
					break;			
				default:
					$('#p1Score').attr('src', 'Resources/Literally Nothing.png');
					break;
			}

			//player 2 score
			switch (p2Score) {
				case "0":
					$('#p2Score').attr('src', 'Resources/Overlay/Win Tick Bo3 2.png');
					break;
				case "1":
					$('#p2Score').attr('src', 'Resources/Overlay/Win Tick Bo3 1.png');
					break;			
				default:
					$('#p2Score').attr('src', 'Resources/Literally Nothing.png');
					break;
			}

			//border to fit the score ticks
			if (bestOfPrev != bestOf) {
				$('#borderP1').attr('src', 'Resources/Overlay/Border Bo3.png');
				$('#borderP2').attr('src', 'Resources/Overlay/Border Bo3.png');
				bestOfPrev = bestOf;
			}
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
		if (startup == true) {
			//the intro vid! WIP WIP WIP
			if (allowIntro == "yes") {
				setTimeout(() => { 
					$('#scoreboardVid').attr('src', 'Resources/Trails/Absa/LoA Blue.webm');
					document.getElementById('scoreboardVid').play();
				 }, 0);				
			}

			//starting with player 1 first
			//change the texts
			$('#p1Name').html(p1Name);
			$('#p1Team').html(p1Team);
			//keeps making the player name font smaller until it fits the box
			p1Wrap.each(function(i, p1Wrap) {
				while (p1Wrap.scrollWidth > p1Wrap.offsetWidth || p1Wrap.scrollHeight > p1Wrap.offsetHeight) {
					var newFontSize = (parseFloat($(p1Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
					$(p1Wrap).css('font-size', newFontSize);
				};
			});
			//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
			gsap.fromTo("#p1Wrapper", 
				{x: -pMove}, //from
				{delay: nameDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

			//check which character is the player using so we know the position
			positionCharacter(p1Character, p1Skin);
			//change the image path depending on the character and skin, or show nothing if the img is not found
			$('#p1Character').attr('src', 'Resources/Characters/' + p1Character + '/' + p1Skin + '.png').on("error",function () {
				$('#p1Character').attr('src', 'Resources/Literally Nothing.png')
			});
			//position the character with the positions we took earlier
			$('#p1Character').css('object-position', charaPosX + "px " + charaPosY + "px");
			$('#p1Character').css('transform', "scale(" + charaScale + ")");
			//set starting position for the character icon, then fade-in-move the character icon to the overlay
			gsap.fromTo("#p1Character",
				{x: -pCharMove},
				{delay: nameDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			//save the character/skin so we fire up the character change code only when this doesnt equal to the previous
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;

			//if its grands, we need to show the [W] and/or the [L] on the players
			if (p1WL == "W") {
				$('#wlP1').attr('src', 'Resources/Overlay/Winners P1.png');
			} else if (p1WL == "L") {
				$('#wlP1').attr('src', 'Resources/Overlay/Losers P1.png');
			} else {
				//or dont show anything at all
				$('#wlP1').attr('src', 'Resources/Literally Nothing.png');
			}
			gsap.fromTo("#wlP1",
				{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
				{delay: nameDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
			//save for later so the animation doesn't repeat over and over
			p1wlPrev = p1WL;


			//took notes from player 1? well, this is exactly the same!
			$('#p2Name').html(p2Name);
			$('#p2Team').html(p2Team);
			p2Wrap.each(function(i, p2Wrap) {
				while (p2Wrap.scrollWidth > p2Wrap.offsetWidth || p2Wrap.scrollHeight > p2Wrap.offsetHeight) {
					var newFontSize = (parseFloat($(p2Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
					$(p2Wrap).css('font-size', newFontSize);
				};
			});
			gsap.fromTo("#p2Wrapper", 
				{x: pMove},
				{delay: nameDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

			positionCharacter(p2Character, p2Skin);
			$('#p2Character').attr('src', 'Resources/Characters/' + p2Character + '/' + p2Skin + '.png').on("error",function () {
				$('#p2Character').attr('src', 'Resources/Literally Nothing.png')
			});
			$('#p2Character').css('object-position', charaPosX + "px " + charaPosY + "px");
			$('#p2Character').css('transform', "scale(" + charaScale + ")");
			gsap.fromTo("#p2Character",
				{x: -pCharMove},
				{delay: nameDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			if (p2WL == "W") {
				$('#wlP2').attr('src', 'Resources/Overlay/Winners P2.png');
			} else if (p2WL == "L") {
				$('#wlP2').attr('src', 'Resources/Overlay/Losers P2.png');
			} else {
				$('#wlP2').attr('src', 'Resources/Literally Nothing.png');
			}
			gsap.fromTo("#wlP2",
				{y: -pMove},
				{delay: nameDelay+.5, y: 0, ease: "power2.out", duration: .5});
			p2wlPrev = p2WL;


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
			rdResize.each(function(i, rdResize) {
				while (rdResize.scrollWidth > rdResize.offsetWidth || rdResize.scrollHeight > rdResize.offsetHeight) {
					var newFontSize = (parseFloat($(rdResize).css('font-size').slice(0,-2)) * .95) + 'px';
					$(rdResize).css('font-size', newFontSize);
				};
			});
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
					//if the text is too big, resize it until it fits
					p1Wrap.each(function(i, p1Wrap) {
						while (p1Wrap.scrollWidth > p1Wrap.offsetWidth || p1Wrap.scrollHeight > p1Wrap.offsetHeight) {
							var newFontSize = (parseFloat($(p1Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
							$(p1Wrap).css('font-size', newFontSize);
						};
					});
					//and finally, fade the name back in with a sick movement
					gsap.to("#p1Wrapper", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}

			//player 1's character icon change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {
				//fade out the image while also moving it because that always looks cool
				gsap.to("#p1Character", {x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pCharMoved});
				function pCharMoved() {
					//depending on the character and skin values, change the img path, or show nothing if it cant be found
					$('#p1Character').attr('src', 'Resources/Characters/' + p1Character + '/' + p1Skin + '.png').on("error",function () {
						$('#p1Character').attr('src', 'Resources/Literally Nothing.png')
					});	
					//what will the positiions of the next img be?
					positionCharacter(p1Character, p1Skin);
					//now that we know, lets apply those positions
					$('#p1Character').css('object-position', charaPosX + "px " + charaPosY + "px");
					$('#p1Character').css('transform', "scale(" + charaScale + ")");
					//and now, fade in and move back
					gsap.fromTo("#p1Character",
						{scale: charaScale}, //set scale keyframe so it doesnt scale while fading back
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
					if (p1WL == "W") {
						$('#wlP1').attr('src', 'Resources/Overlay/Winners P1.png');
					} else if (p1WL == "L") {
						$('#wlP1').attr('src', 'Resources/Overlay/Losers P1.png');
					} else {
						$('#wlP1').attr('src', 'Resources/Literally Nothing.png');
					}
					//move it back!
					gsap.to("#wlP1", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p1wlPrev = p1WL;
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
					p2Wrap.each(function(i, p2Wrap) {
						while (p2Wrap.scrollWidth > p2Wrap.offsetWidth || p2Wrap.scrollHeight > p2Wrap.offsetHeight) {
							var newFontSize = (parseFloat($(p2Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
							$(p2Wrap).css('font-size', newFontSize);
						};
					});
					gsap.to("#p2Wrapper", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}

			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				gsap.to("#p2Character", {x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pCharMoved});
				function pCharMoved() {
					$('#p2Character').attr('src', 'Resources/Characters/' + p2Character + '/' + p2Skin + '.png').on("error",function () {
						$('#p2Character').attr('src', 'Resources/Literally Nothing.png')
					});	
					positionCharacter(p2Character, p2Skin);
					$('#p2Character').css('object-position', charaPosX + "px " + charaPosY + "px");
					$('#p2Character').css('transform', "scale(" + charaScale + ")");
					gsap.fromTo("#p2Character",
						{scale: charaScale},
						{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); 
				}
				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}

			if (p2wlPrev != p2WL) {
				gsap.to("#wlP2", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
				function pwlMoved() {
					//change the thing!
					if (p2WL == "W") {
						$('#wlP2').attr('src', 'Resources/Overlay/Winners P2.png');
					} else if (p2WL == "L") {
						$('#wlP2').attr('src', 'Resources/Overlay/Losers P2.png');
					} else {
						$('#wlP2').attr('src', 'Resources/Literally Nothing.png');
					}
					//move it back!
					gsap.to("#wlP2", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p2wlPrev = p2WL;
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
			
					rdResize.each(function(i, rdResize){
						while(rdResize.scrollWidth > rdResize.offsetWidth || rdResize.scrollHeight > rdResize.offsetHeight){
							var newFontSize = (parseFloat($(rdResize).css('font-size').slice(0,-2)) * .95) + 'px';
							$(rdResize).css('font-size', newFontSize);
						}
					});
					gsap.to("#round", {delay: .2, opacity: 1, duration: fadeInTime});
				}
			}
		}	
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
	MayuAshikaga = {
		neutral: [3, 22, 5],
		alt: [8, 10, 2.5]
	};
	Olympia = {
		neutral: [19, 20, 4.5]
	};
	Pomme = {
		neutral: [30, 22, 4]
	};
	TrummelandAlto = {
		neutral: [10, 30, 2.5],
		alt: [27, -7, 2.5]
	};
	Valkyrie = {
		neutral: [-2, -9, 3.5]
	};
	ZettaAshikaga = {
		neutral: [-7, 23, 6],
		alt: [-15, 5, 2.7]
	};

	//this will be called whenever we need to know the positions of a character from above
	function positionCharacter(pCharacter, pSkin) {
		//this is so characters with spaces on their names also work
		var pCharNoSpaces = pCharacter.replace(/ /g, "");
				
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) {
				charaPosX = window[pCharNoSpaces][pSkin][0];
				charaPosY = window[pCharNoSpaces][pSkin][1];
				charaScale = window[pCharNoSpaces][pSkin][2];
			} else if (pSkin.includes("Alt ")) { //for a group of imgs that have a specific position
				charaPosX = window[pCharNoSpaces].alt[0];
				charaPosY = window[pCharNoSpaces].alt[1];
				charaScale = window[pCharNoSpaces].alt[2];
			} else {
				charaPosX = window[pCharNoSpaces].neutral[0];
				charaPosY = window[pCharNoSpaces].neutral[1];
				charaScale = window[pCharNoSpaces].neutral[2];
			}
		} else {
			charaPosX = 0;
			charaPosY = 0;
			charaScale = 1;
		}	
	}
}