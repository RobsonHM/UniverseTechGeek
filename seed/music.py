import json
import os
import requests
import random
import time

# Use '123' for free testing
API_KEY = "123"
FILE_PATH = "api/music.json"
QUANTITY_TO_ADD = 20

# A list of famous artists to pull random data from
CANDIDATE_ARTISTS = [
    "Daft Punk", "Pink Floyd", "The Beatles", "Radiohead", "Tame Impala", 
    "Michael Jackson", "Eminem", "Gorillaz", "Fleetwood Mac", "Arctic Monkeys",
    "The Weeknd", "Dua Lipa", "Metallica", "Nirvana", "Beyonce", "Drake",
    "Coldplay", "Rihanna", "Kanye West", "Kendrick Lamar", "Queen", "Led Zeppelin"
]

def get_album_details(album_id_tdb, local_id):
    """Fetches details and tracks for a specific album ID with better reliability."""
    try:
        # 1. Get Album Info
        album_url = f"https://www.theaudiodb.com/api/v1/json/{API_KEY}/album.php?m={album_id_tdb}"
        a_res = requests.get(album_url).json()
        if not a_res.get('album'): 
            return None
        a = a_res['album'][0]

        # 2. Wait 1 second (Crucial for the free '123' key)
        time.sleep(1)

        # 3. Get Tracks specifically for this album ID
        tracks_url = f"https://www.theaudiodb.com/api/v1/json/{API_KEY}/track.php?m={album_id_tdb}"
        t_res = requests.get(tracks_url).json()
        
        # Verify if 'track' exists and is a list
        track_data = t_res.get('track')
        if track_data and isinstance(track_data, list):
            track_list = [t.get('strTrack') for t in track_data if t.get('strTrack')]
        else:
            track_list = ["Tracklist not available"]

        return {
            "id": local_id,
            "title": a.get('strAlbum'),
            "artist": a.get('strArtist'),
            "year": a.get('intYearReleased', "Unknown"),
            "genre": a.get('strGenre', "Various"),
            "rating": "8.5",
            "label": a.get('strLabel', "Independent"),
            "cover": a.get('strAlbumThumb', ""),
            "description": (a.get('strDescriptionEN', "No description available.")[:300] + "..."),
            "tracks": track_list # This should now be a full list
        }
    except Exception as e:
        print(f"⚠️ Error details: {e}")
        return None

def main():
    # 1. LOAD EXISTING DATA
    if os.path.exists(FILE_PATH):
        try:
            with open(FILE_PATH, 'r', encoding='utf-8') as f:
                full_data = json.load(f)
        except json.JSONDecodeError:
            full_data = {"albums": []}
    else:
        full_data = {"albums": []}

    album_list = full_data.get("albums", [])
    existing_titles = {item['title'].lower() for item in album_list}
    next_id = max(item["id"] for item in album_list) + 1 if album_list else 1

    print(f"🎲 Gathering {QUANTITY_TO_ADD} random albums from top artists...")
    
    added_count = 0
    while added_count < QUANTITY_TO_ADD:
        artist = random.choice(CANDIDATE_ARTISTS)
        
        # Get all albums for this artist
        url = f"https://www.theaudiodb.com/api/v1/json/{API_KEY}/searchalbum.php?s={artist}"
        try:
            res = requests.get(url).json()
            albums = res.get('album', [])
            if not albums: continue
            
            # Pick a random album from their list
            choice = random.choice(albums)
            title = choice.get('strAlbum')

            if title.lower() in existing_titles:
                continue

            new_album = get_album_details(choice.get('idAlbum'), next_id)
            if new_album:
                album_list.append(new_album)
                existing_titles.add(title.lower())
                added_count += 1
                next_id += 1
                print(f"💿 [{added_count}/{QUANTITY_TO_ADD}] Added: {title} by {artist}")
                time.sleep(0.3) # Avoid rate limiting
        except:
            continue

    # 3. SAVE
    os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump({"albums": album_list}, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! Total albums: {len(album_list)}")

if __name__ == "__main__":
    main()