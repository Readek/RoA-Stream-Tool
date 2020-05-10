![preview](https://cdn.discordapp.com/attachments/574303886869790730/700308095779340298/unknown.png)
# RoA Stream Control

So you want to do a Rivals of Aether stream, huh? Well, today is your lucky day, because I have done tons of work so you don’t have to! With this, you will be able to set up a RoA tournament oriented stream in no time.

---

## Features
- [Easy and fast setup](https://gfycat.com/fragrantfortunatealbacoretuna) using a browser source.
- [Handy interface](https://gfycat.com/slimynimbleequestrian) to quickly change everything you need, like player names, characters, scores, round, casters...
- Every single skin the game has to offer is [supported](https://gfycat.com/sandyinsignificantdodobird) (more than 300 different skins!), including high quality renders.
- Some **Workshop** characters are also [supported](https://gfycat.com/leadingancienthumpbackwhale)!
- [Dynamic, optional intro](https://gfycat.com/revolvingsmarteuropeanpolecat) to be played when changing to the game scene.
- A "[VS Screen](https://gfycat.com/giganticshadowyindianjackal)" used to hide the game while changing replays.
- All the content on the combo boxes can be edited at will. You can quickly change which characters or skins your tournament is going to be using.
- Easy to customize! Add your own skins, workshop characters, custom overlays or even dive into the code if you're brave enough!
- This is **not** a [Stream Control](http://farpnut.net/StreamControl) clone. It doesn't have anything to do with it, everything is custom made.

---

## How to setup
These are instructions for regular OBS Studio, but I imagine you can do the same with other streaming software:
- Get the [latest release](https://github.com/Readek/RoA-Stream-Control/releases).
- Extract somewhere.
- Add a new browser source in OBS.
- Set it to local file -> `RoA Scoreboard.html`.
- Set 1920 width and 1080 height. (if it looks weird, set your canvas resolution to 1080p or make the source fit the screen).
- Use custom frame rate -> 60 (if streaming at 60fps of course).
- Tick `Refresh browser when scene becomes active`.
- Manage it all with the 'RoA Stream Control' executable.

Repeat from the 3rd step to add the VS Screen (*VS Screen.html*).

---

## Advanced setup
Yes, the instructions above could be enough, but we can do better. **All of this is optional** of course.
 
2 basic transitions are included in the `Resources/Webms` folder, intended to be used to change to the game scene and to the vs screen, if you don't have a transition yourself of course. To use them:
- Add a new stinger transition.
- Set the video file to `Game In.webm` if creating the game scene transition, and `Swoosh.webm` if creating a vs screen transition.
- Transition point -> `300 ms`.
- I recommend you to set the Audio Fade Style to crossfade, just in case.
- On the scene's right click menu, set it to Transition Override to the transition you just created.
- Also, you may want to set a hotkey to transition to the game scene so you can press enter ingame to start the replay and press the transition key at the same time. The transition is timed to do so.

Let's do something a bit more advanced. We now have 2 tiny problems. On online replays, [the overlay won't cover the player's icon on the top HUD](https://cdn.discordapp.com/attachments/574303886869790730/705102043102052363/game_hud_oh_no.png), but don't worry, we can fix that! Also, woudn't it be cool to remove the "3, 2, 1" numbers that the game plays when starting a game, so we can properly show our own intro? We can also do that [(heres a gfy of the process to help)](https://gfycat.com/determinedthunderousgavial):
- Download [these super cool rips](https://drive.google.com/open?id=1NEDii3B50eHT_goADzn6t3_O8Uvok0Gs), RIPs 26 and 27 will remove the "*3, 2, 1*", and RIP 31 will remove the icon border of the top HUD. I'll try to keep them updated.
- Get the [Rivals Modding Tool](https://github.com/jam1garner/rivals-modding-tool/), and extract it in the game's folder.
- Create a folder named `sprites` on the game's folder, and drop the rips there.
- Open the exe, select `Replace sprites`.

---

## Other stuff...
Do you want to customize something? Do you need some OBS tips and tricks for a RoA stream? **Please, go to the [wiki](https://github.com/Readek/RoA-Stream-Control/wiki)**!

---

Also, you may wonder, what happened to the old, [lua scripted version](https://drive.google.com/open?id=15o52oz89siOJ5f_toD7zZDjp22dn2t73) of this controller? Well, turns out obs is just not ready for this kind of stuff. Current version of OBS doesn't have any kind of animator, and has to stutter to load every image you want to change, so it was really hard to get around that. Also, was much harder to update. With the javascript version, I wanted to make things better so I could update it with more ease. Anyways, the link of the old version will stay up if you ever want to know about lua obs scripting!

---

### Closing notes
I wanted to say that this has been my first experience ever with Javascript (and one of my first coding projects in general!). If you know how to javascript, you may look at the code and be horrified. I know this project is a bit... *unoptimized* right now, so if anyone knows their stuff, please leave sugestions on how to improve things! Both performance inprovements and bug fixing are things that surpass my level right now, so any help is appreciated.
