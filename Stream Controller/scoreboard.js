window.onload = init;

function init() {
	var xhr = new XMLHttpRequest();
	var scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	var scObj;
	var startup = true;
	var cBust = 0;

	//to resize the texts if they are too large
	var p1Wrap = $('#p1Wrapper'); 
	var p2Wrap = $('#p2Wrapper');
	var rdResize = $('#round');

	//to avoid the code constantly running the same code over and over
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
			//sets the keyframe position for the player text
			TweenMax.set('#p1Wrapper',{css:{x: p1Move}});
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
			//fades in and moves the p1 text to this next keyframe
			TweenMax.to('#p1Wrapper',nameTime,{css:{x: '+0px', opacity: 1}, ease:Quad.easeOut,delay:nameDelay});

			//check which character is the player using so we know the position
			positionCharacter(p1Character, p1Skin);
			//set initial keyframe for the character icon
			TweenMax.set('#p1Character',{css:{x: pCharaMove, scale: charaScale}});
			//change the image path depending on the character and skin, or show nothing if the img is not found
			$('#p1Character').attr('src', 'Resources/Characters/' + p1Character + '/' + p1Skin + '.png').on("error",function () {
				$('#p1Character').attr('src', 'Resources/Literally Nothing.png')
			});
			//position the character with the positions we took earlier
			$('#p1Character').css('object-position', charaPosX + "px " + charaPosY + "px");
			$('#p1Character').css('transform', "scale(" + charaScale + ")");
			//fade in move the character icon to the overlay
			TweenMax.to('#p1Character',nameTime,{css:{x: '+0px', scale: charaScale, opacity: 1},ease:Quad.easeOut,delay:1});
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
			//set starting position some pixels up (it will be covered by the overlay)
			TweenMax.set('#wlP1',{css:{y: p1Move}});
			//and move down to its default position
			TweenMax.to('#wlP1',0.5,{css:{y: '+0px', opacity: 1}, ease:Quad.easeOut,delay:nameDelay+0.4});
			//save for later so the animation doesn't repeat over and over
			p1wlPrev = p1WL;


			//took notes from player 1? well, this is exactly the same!
			TweenMax.set('#p2Wrapper',{css:{x: p2Move}});
			$('#p2Name').html(p2Name);
			$('#p2Team').html(p2Team);
			p2Wrap.each(function(i, p2Wrap) {
				while (p2Wrap.scrollWidth > p2Wrap.offsetWidth || p2Wrap.scrollHeight > p2Wrap.offsetHeight) {
					var newFontSize = (parseFloat($(p2Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
					$(p2Wrap).css('font-size', newFontSize);
				};
			});
			TweenMax.to('#p2Wrapper',nameTime,{css:{x: '+0px', opacity: 1}, ease:Quad.easeOut,delay:nameDelay});

			positionCharacter(p2Character, p2Skin);
			TweenMax.set('#p2Character',{css:{x: pCharaMove, scale: charaScale}});
			$('#p2Character').attr('src', 'Resources/Characters/' + p2Character + '/' + p2Skin + '.png').on("error",function () {
				$('#p2Character').attr('src', 'Resources/Literally Nothing.png')
			});
			$('#p2Character').css('object-position', charaPosX + "px " + charaPosY + "px");
			$('#p2Character').css('transform', "scale(" + charaScale + ")");
			TweenMax.to('#p2Character',nameTime,{css:{x: '+0px', scale: charaScale, opacity: 1},ease:Quad.easeOut,delay:1});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			if (p2WL == "W") {
				$('#wlP2').attr('src', 'Resources/Overlay/Winners P2.png');
			} else if (p2WL == "L") {
				$('#wlP2').attr('src', 'Resources/Overlay/Losers P2.png');
			} else {
				$('#wlP2').attr('src', 'Resources/Literally Nothing.png');
			}
			TweenMax.set('#wlP2',{css:{y: p1Move}});
			TweenMax.to('#wlP2',0.5,{css:{y: '+0px', opacity: 1}, ease:Quad.easeOut,delay:nameDelay+0.4});
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
				TweenMax.to('#p1Wrapper',.2,{css:{x: p1Move, opacity: 0},ease:Quad.easeOut,delay:0,onComplete:function(){
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
					TweenMax.to('#p1Wrapper',.25,{css:{x: '+0px', opacity: 1},ease:Quad.easeOut,delay:.1});
				}})
			}
			//player 1's character icon change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {
				//fade out the image while also moving it because that always looks cool
				TweenMax.to('#p1Character',.2,{css:{x: pCharaMove, opacity: 0},ease:Quad.easeOut,delay:0,onComplete:function(){
					//depending on the character and skin values, change the img path, or show nothing if it cant be found
					$('#p1Character').attr('src', 'Resources/Characters/' + p1Character + '/' + p1Skin + '.png').on("error",function () {
						$('#p1Character').attr('src', 'Resources/Literally Nothing.png')
					});	
					//what will the positiions of the next img be?
					positionCharacter(p1Character, p1Skin);
					//now that we know, lets apply those positions
					$('#p1Character').css('object-position', charaPosX + "px " + charaPosY + "px");
					$('#p1Character').css('transform', "scale(" + charaScale + ")");
					//this keyframe is to scale the character before fading the img, so it just moves on the next key
					TweenMax.to('#p1Character',0,{css:{scale: charaScale},ease:Quad.easeOut,delay:0});
					//and now, fade in and move back
					TweenMax.to('#p1Character',.3,{css:{x: '+0xp', opacity: 1},ease:Quad.easeOut,delay:.15});
				}});
				p1CharacterPrev = p1Character;
				p1SkinPrev = p1Skin;
			}

			//the [W] and [L] status for grand finals
			if (p1wlPrev != p1WL) {
				//move it away!
				TweenMax.to('#wlP1',.5,{css:{y: p1Move},ease:Quad.easeIn,delay:0,onComplete:function(){
					//change the thing!
					if (p1WL == "W") {
						$('#wlP1').attr('src', 'Resources/Overlay/Winners P1.png');
					} else if (p1WL == "L") {
						$('#wlP1').attr('src', 'Resources/Overlay/Losers P1.png');
					} else {
						$('#wlP1').attr('src', 'Resources/Literally Nothing.png');
					}
					//move it back!
					TweenMax.to('#wlP1',.5,{css:{y: '+0px', opacity: 1}, ease:Quad.easeOut,delay:0.1});
				}});
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
				TweenMax.to('#p2Wrapper',.3,{css:{x: p2Move, opacity: 0},ease:Quad.easeOut,delay:0,onComplete:function(){
					$('#p2Wrapper').css('font-size',nameSize);
					$('#p2Name').html(p2Name);
					$('#p2Team').html(p2Team);
			
					p2Wrap.each(function(i, p2Wrap){
						while(p2Wrap.scrollWidth > p2Wrap.offsetWidth || p2Wrap.scrollHeight > p2Wrap.offsetHeight){
							var newFontSize = (parseFloat($(p2Wrap).css('font-size').slice(0,-2)) * .95) + 'px';
							$(p2Wrap).css('font-size', newFontSize);
						}
					});
					
					TweenMax.to('#p2Wrapper',.25,{css:{x: '+0px', opacity: 1},ease:Quad.easeOut,delay:.1});
				}});
			}

			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				TweenMax.to('#p2Character',.2,{css:{x:pCharaMove, opacity: 0},ease:Quad.easeOut,delay:0,onComplete:function(){
					$('#p2Character').attr('src', 'Resources/Characters/' + p2Character + '/' + p2Skin + '.png').on("error",function () {
						$('#p2Character').attr('src', 'Resources/Literally Nothing.png')
					});
					positionCharacter(p2Character, p2Skin);
					$('#p2Character').css('object-position', charaPosX + "px " + charaPosY + "px");
					$('#p2Character').css('transform', "scale(" + charaScale + ")");

					TweenMax.to('#p2Character',0,{css:{scale: charaScale},ease:Quad.easeOut,delay:0});
					TweenMax.to('#p2Character',.3,{css:{x: '+0xp', opacity: 1},ease:Quad.easeOut,delay:.15});
				}});

				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}

			if (p2wlPrev != p2WL) {
				//move it away!
				TweenMax.to('#wlP2',.5,{css:{y: p1Move},ease:Quad.easeIn,delay:0,onComplete:function(){
					//change the thing!
					if (p2WL == "W") {
						$('#wlP2').attr('src', 'Resources/Overlay/Winners P2.png');
					} else if (p2WL == "L") {
						$('#wlP2').attr('src', 'Resources/Overlay/Losers P2.png');
					} else {
						$('#wlP2').attr('src', 'Resources/Literally Nothing.png');
					}
					//move it back!
					TweenMax.to('#wlP2',.5,{css:{y: '+0px', opacity: 1}, ease:Quad.easeOut,delay:0.1});
				}});
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
				TweenMax.to('#round',.2,{css:{opacity: 0},ease:Quad.easeOut,delay:0,onComplete:function(){
					$('#round').css('font-size',roundSize);
					$('#round').html(round);					
			
					rdResize.each(function(i, rdResize){
						while(rdResize.scrollWidth > rdResize.offsetWidth || rdResize.scrollHeight > rdResize.offsetHeight){
							var newFontSize = (parseFloat($(rdResize).css('font-size').slice(0,-2)) * .95) + 'px';
							$(rdResize).css('font-size', newFontSize);
						}
					});
					
					TweenMax.to('#round',.2,{css:{opacity: 1},ease:Quad.easeOut,delay:0});
				}});
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