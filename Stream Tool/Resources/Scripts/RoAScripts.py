import os
import sys
import json
import shutil
from RoADictionary import *

def get_player_string(player):
    string = ''
    if player['tag']:
        string += player['tag'] + ' - '
    string += player['name'] + ' (' + player['character'] + ')'
    return string

def get_player_string_v2(player):
    string = ''
    if player['tag']:
        string += player['tag'] + ' - '
    string += player['name']
    for i, character in enumerate(player['characters']):
        if i == 0:
            string += " ("            
        else:
            string += ","
        string += character
    string += ")"
        
    print(string)
    return string


def update_player_jsons(players):
    for player in players:
        update_player_json(player)

def update_player_json(player):
    if json.loads(player):
        player = json.loads(player)

    if not player['name']:
        return

    data = {
        "name": player['name'],
        "twitter": player['twitter'],
        "tag": player['tag'],
        "characters": [
            {
                "character": player['character'], "skin": player['skin']
            }
        ]
    }

    if os.path.isfile(player_info_dir + player['name'] + '.json') == False:
        with open(player_info_dir + player['name'] + '.json', 'w') as outfile:
            x = json.dumps(data, indent=4)
            outfile.write(x)
        outfile.close()

    else:
        player_file = open(player_info_dir + player['name'] + '.json', 'r+')
        player_json = json.load(player_file)
        player_file.close()

        new_character = True

        for character in player_json['characters']:
            if character['character'] == player['character']:
                character['skin'] = player['skin']
                new_character = False

        if new_character == True:
            player_json['characters'] += (data['characters'])
        
        player_json['twitter'] = player['twitter']
        player_json['tag'] = player['tag']
            
        open(player_info_dir + player['name'] + '.json', "w").write(json.dumps(player_json, ensure_ascii=False, indent=4))

def clear_set_info():
    if os.path.isfile(set_data_loc) == True:
        os.remove(set_data_loc)

def update_set_info(players, tournamentName, round):
    data = {
        "player" : [],
        "tournamentName" : tournamentName,
        "round": round,
    }
    for player in players:
        data["player"].append ({
                "name" : player['name'],
                "twitter" : player['twitter'],
                "tag": player['tag'],
                "characters" : [player['character']]
                })

    if os.path.isfile(set_data_loc) == False:
        with open(set_data_loc, 'w') as outfile:
            x = json.dumps(data, indent=4)
            outfile.write(x)
        outfile.close()
    else:
        set_info_file = open(set_data_loc, 'r+')
        set_info_json = json.load(set_info_file)
        set_info_file.close()

        for player in data['player']:
            for json_player in set_info_json['player']:
                if player['name'] == json_player['name']:
                    tempCharactersArray = []
                    for character in json_player['characters']:
                        if character not in player['characters']:
                            # Place existing characters on list first
                            tempCharactersArray.append(character)
                    # Add most recent character selection to the list
                    tempCharactersArray += player['characters']
                    player['characters'] = tempCharactersArray

        open(set_data_loc, "w").write(json.dumps(data, indent=4))


def update_score(player):
    scoreboard_file = open(scoreboard_loc, "r+")
    scoreboard_json = json.load(scoreboard_file)
    # update_player_json(scoreboard_json['player'][0])
    # update_player_json(scoreboard_json['player'][1])
    # update_set_info(scoreboard_json['player'], scoreboard_json['tournamentName'], scoreboard_json['round'])
        
    if player == 'null':
        scoreboard_json['player'][0]['name'] = ""
        scoreboard_json['player'][1]['name'] = ""
    else:
        player = int(player)
        if player == 0 or player == 1:
            scoreboard_json['score'][player] = scoreboard_json['score'][player] + 1
        else:
            scoreboard_json['score'] = [0,0]      
    scoreboard_json['externalUpdate'] = True
    # open(scoreboard_loc, "w").write(json.dumps(scoreboard_json, indent=4))
    open(scoreboard_loc, "w").write(json.dumps(scoreboard_json, ensure_ascii=False, indent=2))

def update_scores(player1Score, player2Score):
    scoreboard_file = open(scoreboard_loc, "r+")
    scoreboard_json = json.load(scoreboard_file)
    scoreboard_file.close()

    update_player_jsons(scoreboard_json['player'])
    # update_player_json(scoreboard_json['player'][0])
    # update_player_json(scoreboard_json['player'][1])
    update_set_info(scoreboard_json['player'], scoreboard_json['tournamentName'], scoreboard_json['round'])
    
    # scoreboard_json['score'] = [player1Score,player2Score]      
   
    # open(scoreboard_loc, "w").write(json.dumps(scoreboard_json, indent=4))


def rename_files():
    if os.path.isfile(set_data_loc) == False:
        return
    set_data_file = open(set_data_loc, "r+", encoding='utf-8-sig')
    set_data_json = json.load(set_data_file)
    set_data_file.close()

    tournament = set_data_json['tournamentName']
    round = set_data_json['round']
    player1 = set_data_json['player'][0]
    player2 = set_data_json['player'][1]

    newfilename = tournament + ' - ' + round + ' - ' + get_player_string_v2(player1) + ' Vs ' + get_player_string_v2(player2)
    tournament_recordings_dir = recordings_dir + "/" + tournament + '/'
    if os.path.isdir(tournament_recordings_dir) == False:
        os.mkdir(tournament_recordings_dir)
        
    for count, filename in enumerate(os.listdir(recordings_dir)):
        file_name, file_extension = os.path.splitext(filename)
        if file_extension == '.png' or file_extension == '.flv' or file_extension == '.mp4':
            shutil.move(recordings_dir + filename, recordings_dir + tournament + '/' + newfilename + file_extension)