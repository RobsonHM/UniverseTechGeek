import json
import os
import requests
from dotenv import load_dotenv

# Configuration
FILE_PATH = "api/books.json"

def get_real_book(title, book_id):
    """Fetches book data from Google Books API."""
    # Use 'intitle' to get the most accurate result
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}"
    
    try:
        res = requests.get(url).json()
        if not res.get('items'):
            print(f"❌ Could not find book: {title}")
            return None
        
        # Get the first search result
        volume = res['items'][0]['volumeInfo']
        
        # Extract ISBN-13 if available
        isbns = volume.get('industryIdentifiers', [])
        isbn_13 = next((i['identifier'] for i in isbns if i['type'] == 'ISBN_13'), "N/A")

        return {
            "id": book_id,
            "title": volume.get('title'),
            "author": ", ".join(volume.get('authors', ["Unknown"])),
            "genre": ", ".join(volume.get('categories', ["General"])),
            "rating": volume.get('averageRating', 0),
            "cover": volume.get('imageLinks', {}).get('thumbnail', ""),
            "description": volume.get('description', "No description available."),
            "publisher": volume.get('publisher', "Unknown"),
            "year": volume.get('publishedDate', "0000")[:4],
            "pages": str(volume.get('pageCount', 0)),
            "language": volume.get('language', "en"),
            "especificacoes": {
                "isbn": isbn_13,
                "dimensoes": "Check Publisher Website", # API usually doesn't provide physical dimensions
                "formato": "Hardcover/Paperback",
                "peso": "N/A"
            }
        }
    except Exception as e:
        print(f"Error fetching {title}: {e}")
        return None

def main():
    # 1. Load your existing JSON
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = [] # If file is empty, start with a list

    # 2. Books you want to add
    #new_book_titles = ["The Hobbit", "1984", "Atomic Habits"]
    new_book_titles =[
        "divine comedy"
    ]
    # 3. Get next ID
    next_id = data[-1]["id"] + 1 if data else 1

    # 4. Fetch and Append
    for title in new_book_titles:
        book = get_real_book(title, next_id)
        if book:
            data.append(book)
            next_id += 1
            print(f"📚 Added Book: {title}")

    # 5. Save back to JSON
    os.makedirs(os.path.dirname(FILE_PATH), exist_ok=True)
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Success! Saved to {FILE_PATH}")

if __name__ == "__main__":
    main()