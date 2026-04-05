import json
import os
import requests
import random
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY_MOVIES")
FILE_PATH = "api/movies_series.json"

def get_real_movie(title, movie_id):
    """Fetches real movie data from TMDb API."""
    search_url = f"https://api.themoviedb.org/3/search/movie?api_key={API_KEY}&query={title}"
    try:
        res = requests.get(search_url).json()
        if not res.get('results'):
            return None
        
        tmdb_id = res['results'][0]['id']
        detail_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}&append_to_response=credits"
        details = requests.get(detail_url).json()

        return {
            "id": movie_id,
            "title": details.get('title'),
            "year": int(details.get('release_date', '0000')[:4]),
            "rating": round(details.get('vote_average', 0), 1),
            "genre": [g['name'] for g in details.get('genres', [])],
            "duration": f"{details.get('runtime', 0)} min",
            "director": next((m['name'] for m in details['credits']['crew'] if m['job'] == 'Director'), "Unknown"),
            "cast": [m['name'] for m in details['credits']['cast'][:4]],
            "poster": f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}",
            "synopsis": details.get('overview')
        }
    except Exception as e:
        print(f"Error fetching movie {title}: {e}")
        return None

def get_real_series(title, series_id):
    """Fetches real TV series data from TMDb API."""
    search_url = f"https://api.themoviedb.org/3/search/tv?api_key={API_KEY}&query={title}"
    try:
        res = requests.get(search_url).json()
        if not res.get('results'):
            return None
        
        tmdb_id = res['results'][0]['id']
        detail_url = f"https://api.themoviedb.org/3/tv/{tmdb_id}?api_key={API_KEY}&append_to_response=credits"
        details = requests.get(detail_url).json()

        return {
            "id": series_id,
            "title": details.get('name'),
            "year": int(details.get('first_air_date', '0000')[:4]),
            "seasons": details.get('number_of_seasons', 1),
            "rating": round(details.get('vote_average', 0), 1),
            "genre": [g['name'] for g in details.get('genres', [])],
            "creator": details.get('created_by')[0]['name'] if details.get('created_by') else "Unknown",
            "cast": [m['name'] for m in details['credits']['cast'][:4]],
            "poster": f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}",
            "synopsis": details.get('overview')
        }
    except Exception as e:
        print(f"Error fetching series {title}: {e}")
        return None

def get_random_title(media_type="movie"):
    """Fetches a random popular title from TMDb."""
    random_page = random.randint(1, 20)
    url = f"https://api.themoviedb.org/3/discover/{media_type}?api_key={API_KEY}&page={random_page}&sort_by=popularity.desc"
    res = requests.get(url).json()
    results = res.get('results', [])
    if results:
        choice = random.choice(results)
        return choice.get('title') if media_type == "movie" else choice.get('name')
    return None

def main():
    if not API_KEY:
        print("❌ Error: TMDB_API_KEY_MOVIES not found in .env file.")
        return

    # 1. Load existing JSON
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {"movies": [], "series": []}

    # 2. Setup existing titles to avoid duplicates
    existing_movies = {m['title'].lower() for m in data['movies']}
    existing_series = {s['title'].lower() for s in data['series']}

    # 3. Define titles to add (Specific + 2 Random each)
    target_movies = []
    target_series = []
    
    # Add randoms to the list
    for _ in range(2):
        target_movies.append(get_random_title("movie"))
        target_series.append(get_random_title("tv"))

    # 4. Get next IDs
    next_m_id = data["movies"][-1]["id"] + 1 if data["movies"] else 1
    next_s_id = data["series"][-1]["id"] + 1 if data["series"] else 101

    # 5. Fetch and Append Movies
    for title in target_movies:
        if title and title.lower() not in existing_movies:
            movie = get_real_movie(title, next_m_id)
            if movie:
                data["movies"].append(movie)
                next_m_id += 1
                print(f"🎬 Added Movie: {title}")
        elif title:
            print(f"⏩ Skipping (Already Exists): {title}")

    # 6. Fetch and Append Series
    for title in target_series:
        if title and title.lower() not in existing_series:
            series = get_real_series(title, next_s_id)
            if series:
                data["series"].append(series)
                next_s_id += 1
                print(f"📺 Added Series: {title}")
        elif title:
            print(f"⏩ Skipping (Already Exists): {title}")

    # 7. Save back to JSON
    os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! Data saved to {FILE_PATH}")

if __name__ == "__main__":
    main()