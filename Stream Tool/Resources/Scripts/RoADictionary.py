from pathlib import Path


root_dir = Path(__file__).resolve().parents[3].__str__() + "/"
recordings_dir = root_dir + "Recordings/"
stream_tool_dir = root_dir + "Stream Tool/"
resources_dir = stream_tool_dir + "Resources/"
script_dir = resources_dir + "Scripts/"
scoreboard_loc = resources_dir + "Texts/ScoreboardInfo.json"
player_info_dir = resources_dir + "Texts/Player Info/"
set_data_filename = "SetDataInfo.json"
set_data_loc = resources_dir + "Texts/" + set_data_filename