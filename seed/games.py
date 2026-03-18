import json
import os
import requests
import random
import datetime
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

print(f"Debug: Client ID is {'Found' if os.getenv('IGDB_CLIENT_ID') else 'NOT FOUND'}")

CLIENT_ID = os.getenv("IGDB_CLIENT_ID")
CLIENT_SECRET = os.getenv("IGDB_CLIENT_SECRET")
# Ensure the path is correct relative to where you run the script
FILE_PATH = "api/games.json"
QUANTITY_TO_ADD = 5 

def get_igdb_token():
    auth_url = f"https://id.twitch.tv/oauth2/token?client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=client_credentials"
    try:
        res = requests.post(auth_url)
        if res.status_code != 200:
            print(f"❌ Auth Error {res.status_code}: {res.text}")
            return None
        return res.json().get('access_token')
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def get_random_game_titles(token, count):
    headers = {
        'Client-ID': CLIENT_ID, 
        'Authorization': f'Bearer {token}',
        'Content-Type': 'text/plain'
    }
    
    # We will pick a random starting ID instead of using 'offset'
    # Most popular games have IDs between 1 and 150000
    random_start = random.randint(1, 10000)
    
    # SIMPLEST POSSIBLE QUERY: Just get 5 games where ID is greater than a random number
    query = f'fields name; limit {count}; where id > {random_start};'
    
    try:
        response = requests.post('https://api.igdb.com/v4/games', headers=headers, data=query)
        
        if response.status_code != 200:
            print(f"❌ IGDB API Error {response.status_code}: {response.text}")
            return []
        
        res = response.json()
        
        if not res or len(res) == 0:
            # Fallback: Just get the first 5 games ever
            print("⚠️ Random range failed, fetching top 5 defaults...")
            fallback_query = f'fields name; limit {count};'
            res = requests.post('https://api.igdb.com/v4/games', headers=headers, data=fallback_query).json()

        return [g['name'] for g in res]
    except Exception as e:
        print(f"❌ Script Error: {e}")
        return []
    
def get_real_game(title, game_id, token):
    headers = {'Client-ID': CLIENT_ID, 'Authorization': f'Bearer {token}'}
    # Clean the title for the search query
    safe_title = title.replace('"', '')
    query = f'search "{safe_title}"; fields name, summary, total_rating, involved_companies.company.name, first_release_date, platforms.name, genres.name, cover.url, screenshots.url; limit 1;'
    
    try:
        res = requests.post('https://api.igdb.com/v4/games', headers=headers, data=query).json()
        if not res: return None
        g = res[0]
        
        ts = g.get('first_release_date')
        date = datetime.datetime.fromtimestamp(ts).strftime('%B %d, %Y') if ts else "Unknown"
        raw_rating = g.get('total_rating', 0)
        
        return {
            "id": game_id,
            "titulo": g.get('name'),
            "nota": round(raw_rating / 10, 1) if raw_rating else 0.0,
            "sinopse": g.get('summary', "No description available."),
            "tags": [genre['name'] for genre in g.get('genres', [])],
            "desenvolvedora": g.get('involved_companies', [{}])[0].get('company', {}).get('name', "Unknown") if g.get('involved_companies') else "Unknown",
            "editora": "Consult Official Website",
            "lancamento": date,
            "plataformas": ", ".join([p['name'] for p in g.get('platforms', [])[:3]]),
            "screenshots": [f"https:{s['url']}".replace('t_thumb', 't_1080p') for s in g.get('screenshots', [])[:4]],
            "requisitos": {
                "minimos": { "so": "Windows 10", "cpu": "i5-4460", "ram": "8 GB", "gpu": "GTX 1060", "armazenamento": "50 GB" },
                "recomendados": { "so": "Windows 11", "cpu": "i7-9700", "ram": "16 GB", "gpu": "RTX 2070", "armazenamento": "50 GB SSD" }
            }
        }
    except Exception as e:
        print(f"⚠️ Error with {title}: {e}")
        return None

def main():
    token = get_igdb_token()
    if not token: return

    # Load existing data
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    existing_titles = {game['titulo'].lower() for game in data}

    print(f"🎲 Requesting {QUANTITY_TO_ADD} random games...")
    random_titles = get_random_game_titles(token, QUANTITY_TO_ADD)
    
    if not random_titles:
        print("❌ No titles found. If this persists, check if your Client ID is correct.")
        return

    next_id = data[-1]["id"] + 1 if data else 1

    for title in random_titles:
        if title.lower() in existing_titles:
            continue
        game = get_real_game(title, next_id, token)
        if game:
            data.append(game)
            next_id += 1
            print(f"🎮 Added: {title}")

    # Ensure directory exists before saving
    os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ All done! {len(data)} total games in {FILE_PATH}")

if __name__ == "__main__":
    main()