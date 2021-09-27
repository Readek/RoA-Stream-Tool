from RoAScripts import *

scoreboard_file = open(scoreboard_loc, "r+")
scoreboard_json = json.load(scoreboard_file)
scoreboard_file.close()
update_set_info(scoreboard_json['player'], scoreboard_json['tournamentName'], scoreboard_json['round'])
