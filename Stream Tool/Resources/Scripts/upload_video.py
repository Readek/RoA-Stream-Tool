#!z:\\python39
 
import httplib2
import os
import random
import sys
import time
import json
import shutil
import argparse
from RoADictionary import *

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client.tools import argparser, run_flow


# Explicitly tell the underlying HTTP transport library not to retry, since
# we are handling retry logic ourselves.
httplib2.RETRIES = 1

# Maximum number of times to retry before giving up.
MAX_RETRIES = 10

# Always retry when these exceptions are raised.
RETRIABLE_EXCEPTIONS = (httplib2.HttpLib2Error, IOError)

# Always retry when an apiclient.errors.HttpError with one of these status
# codes is raised.
RETRIABLE_STATUS_CODES = [500, 502, 503, 504]

# The CLIENT_SECRETS_FILE variable specifies the name of a file that contains
# the OAuth 2.0 information for this application, including its client_id and
# client_secret. You can acquire an OAuth 2.0 client ID and client secret from
# the Google API Console at
# https://console.developers.google.com/.
# Please ensure that you have enabled the YouTube Data API for your project.
# For more information about using OAuth2 to access the YouTube Data API, see:
#   https://developers.google.com/youtube/v3/guides/authentication
# For more information about the client_secrets.json file format, see:
#   https://developers.google.com/api-client-library/python/guide/aaa_client_secrets
CLIENT_SECRETS_FILE = "client_secrets.json"
YOUTUBE_SET_DATA_FILE = "youtubeUploadData.json"

# This OAuth 2.0 access scope allows an application to upload files to the
# authenticated user's YouTube channel, but doesn't allow other types of access.
YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube"
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

# This variable defines a message to display if the CLIENT_SECRETS_FILE is
# missing.
MISSING_CLIENT_SECRETS_MESSAGE = """
WARNING: Please configure OAuth 2.0

To make this sample run you will need to populate the client_secrets.json file
found at:

   %s

with information from the API Console
https://console.developers.google.com/

For more information about the client_secrets.json file format, please visit:
https://developers.google.com/api-client-library/python/guide/aaa_client_secrets
""" % os.path.abspath(os.path.join(os.path.dirname(__file__),
                                   CLIENT_SECRETS_FILE))

VALID_PRIVACY_STATUSES = ("public", "private", "unlisted")

def get_authenticated_service(args):
  flow = flow_from_clientsecrets(CLIENT_SECRETS_FILE,
    scope=YOUTUBE_UPLOAD_SCOPE,
    message=MISSING_CLIENT_SECRETS_MESSAGE)

  storage = Storage("%s-oauth2.json" % sys.argv[0])
  credentials = storage.get()

  if credentials is None or credentials.invalid:
    credentials = run_flow(flow, storage, args)

  return build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
    http=credentials.authorize(httplib2.Http()))

def initialize_upload(youtube, options, playlists):
  tags = None
  if options['keywords']:
    tags = options['keywords'].split(",")

  body=dict(
    snippet=dict(
      title=options['title'],
      description=options['description'],
      tags=tags,
      categoryId=options['category'],
      thumbnails=dict(
        default=dict(
          url=options['thumbnailUrl']
        )
      )
    ),
    status=dict(
      privacyStatus=options['privacyStatus'],
      selfDeclaredMadeForKids=options['madeForKids']
    ),
    recordingDetails=dict(
      recordingDate=options['date']
    )
  )

  # Call the API's videos.insert method to create and upload the video.
  insert_request = youtube.videos().insert(
    part=",".join(body.keys()),
    body=body,
    # The chunksize parameter specifies the size of each chunk of data, in
    # bytes, that will be uploaded at a time. Set a higher value for
    # reliable connections as fewer chunks lead to faster uploads. Set a lower
    # value for better recovery on less reliable connections.
    #
    # Setting "chunksize" equal to -1 in the code below means that the entire
    # file will be uploaded in a single HTTP request. (If the upload fails,
    # it will still be retried where it left off.) This is usually a best
    # practice, but if you're using Python older than 2.6 or if you're
    # running on App Engine, you should set the chunksize to something like
    # 1024 * 1024 (1 megabyte).
    media_body=MediaFileUpload(options['file'], chunksize=-1, resumable=True)
  )

  resumable_upload(insert_request, options, playlists, youtube)

def create_new_playlist(youtube, options, description):
  body=dict(
    snippet=dict(
      title=options['playlistTitle'],
      description=description
    ),
    status=dict(
      privacyStatus=options['privacyStatus']
    )
  )

  request=youtube.playlists().insert(
    part=",".join(body.keys()),
    body=body
  )
    
  response = request.execute()

  if 'id' in response:
    print ("Playlist id '%s' was successfully uploaded." % response['id'])
    return response['id']
  else:
    exit("The upload failed with an unexpected response: %s" % response)

def add_to_playlist(youtube, playlistId, videoId):
  body=dict(
    snippet=dict(
      playlistId=playlistId,
      resourceId=dict(
        videoId=videoId,
        kind="youtube#video"
      )
    )
  )

  request=youtube.playlistItems().insert(
    part=",".join(body.keys()),
    body=body
  )

  response = request.execute()

def insert_thumbnail(youtube, videoId, thumbnailPath):
  request = youtube.thumbnails().set(
    videoId=videoId,
    media_body=MediaFileUpload(thumbnailPath)
  )
  response = request.execute()

# This method implements an exponential backoff strategy to resume a
# failed upload.
def resumable_upload(insert_request, options, playlists, youtube):
  response = None
  error = None
  retry = 0
  while response is None:
    try:
      print ("Uploading file...")
      status, response = insert_request.next_chunk()
      if response is not None:
        if 'id' in response:
          print ("Video id '%s' was successfully uploaded." % response['id'])

          insert_thumbnail(youtube, response['id'], options['thumbnailUrl'])
          for playlist in playlists:
            add_to_playlist(youtube, playlist, response['id'])
        else:
          exit("The upload failed with an unexpected response: %s" % response)
    except HttpError as e:
      if e.resp.status in RETRIABLE_STATUS_CODES:
        error = "A retriable HTTP error %d occurred:\n%s" % (e.resp.status, e.content)
      else:
        raise
    except RETRIABLE_EXCEPTIONS as e:
      error = "A retriable error occurred: %s" % e

    if error is not None:
      print (error)
      retry += 1
      if retry > MAX_RETRIES:
        exit("No longer attempting to retry.")

      max_sleep = 2 ** retry
      sleep_seconds = random.random() * max_sleep
      print ("Sleeping %f seconds and then retrying..." % sleep_seconds)
      time.sleep(sleep_seconds)

def upload_videos(args):
  youtube_data_file = open(YOUTUBE_SET_DATA_FILE, "r+", encoding='utf-8-sig')
  youtube_data_json = json.load(youtube_data_file)
  youtube_data_file.close()

  descriptionFile = open(youtube_data_json["descriptionLoc"], "r")
  description = descriptionFile.read()
  descriptionFile.close()
  
  youtube = get_authenticated_service(args)

  playlists = []

  if youtube_data_json['addToFullPlaylist'] == True:
    playlists.append(youtube_data_json['fullTourneyPlaylist'])

  newPlaylistId = create_new_playlist(youtube, youtube_data_json, description)

  playlists.append(newPlaylistId)

  recordingsLoc = "X:\OBS\Recordings" + "/" + youtube_data_json["tournament"]
  
  for set in youtube_data_json['setInfo']:
    data = {
      "title":set["title"],
      "description":description,
      "keywords":youtube_data_json["keywords"],
      "category":youtube_data_json["category"],
      "privacyStatus":youtube_data_json["privacyStatus"],
      "madeForKids":youtube_data_json["madeForKids"],
      "file":recordingsLoc + "/" + set["filename"] + ".flv",
      "thumbnailUrl":recordingsLoc + "/" + set["filename"] + ".png",
      "date": youtube_data_json["date"]
    }

    try:
      initialize_upload(youtube, data, playlists)
    except HttpError as e:
      print ("An HTTP error %d occurred:\n%s" % (e.resp.status, e.content))

if __name__ == '__main__':
  argparser.add_argument("--useJsonFile", default=True, action=argparse.BooleanOptionalAction, help="If True, will run the upload_vidoes without any user input.")
  argparser.add_argument("--file", help="Video file to upload")
  argparser.add_argument("--title", help="Video title", default="Test Title")
  argparser.add_argument("--description", help="Video description",
    default="Test Description")
  argparser.add_argument("--category", default="20",
    help="Numeric video category. " +
      "See https://developers.google.com/youtube/v3/docs/videoCategories/list")
  argparser.add_argument("--keywords", help="Video keywords, comma separated",
    default="")
  argparser.add_argument("--privacyStatus", choices=VALID_PRIVACY_STATUSES,
    default=VALID_PRIVACY_STATUSES[0], help="Video privacy status.")
  argparser.add_argument("--madeForKids", default=False, help="Made for Kids flag T/F.")
  argparser.add_argument("--thumbnailUrl", help="Url of a thumbnail")
  argparser.add_argument("--playlistTitle", help="Title of the playlist")
  args = argparser.parse_args()

  
  if (args.useJsonFile == True):
    upload_videos(args)
  else:
    if not os.path.exists(args.file):
      exit("Please specify a valid file using the --file= parameter.")
    youtube = get_authenticated_service(args)
    try:
      # initialize_upload(youtube, args)
      create_new_playlist(youtube, args)
    except HttpError as e:
      print ("An HTTP error %d occurred:\n%s" % (e.resp.status, e.content))
