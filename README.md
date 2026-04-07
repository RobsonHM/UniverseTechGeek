
# UniverseTechGeek

>A collaborative platform for managing and reviewing books, games, movies/series, and music. Built with Flask and a modular frontend, UniverseTechGeek enables users to explore, review, and interact with a wide range of media content.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [License](#license)

---

## Project Overview
UniverseTechGeek is a web application designed to help users discover, review, and manage their favorite books, games, movies/series, and music. The project demonstrates best practices in teamwork, code organization, and modern web development using Python (Flask), JavaScript, and Docker.

## Features
- User authentication and profile management
- Browse and search books, games, movies/series, and music
- Submit and view reviews for each media type
- RESTful API backend with Flask
- Responsive frontend with modular JS and HTML pages
- Persistent storage using SQLite
- Dockerized for easy deployment

## Technologies Used
- Python 3.x
- Flask
- Flask-CORS
- SQLite
- JavaScript (modular JS files per feature)
- HTML5 & CSS3
- Docker & Docker Compose

## Installation & Setup

### Prerequisites
- Python 3.x
- Docker & Docker Compose (optional, for containerized setup)

### Local Setup
1. Clone the repository:
	```bash
	git clone <repo-url>
	cd UniverseTechGeek
	```
2. Install dependencies:
	```bash
	pip install -r requirements.txt
	```
3. Run the Flask app:
	```bash
	python app.py
	```
4. Access the app at `http://localhost:5000` (if running with `python app.py`).
   
	If you are using Docker Compose, access the API at `http://localhost:5001`.

### Docker Setup
1. Build and run with Docker Compose:
	```bash
	docker-compose up --build
	```
2. The API will be available at `http://localhost:5001`.

## Usage
- Visit the home page and navigate through Books, Games, Movies/Series, and Music sections.
- Register or log in to submit reviews and manage your profile.
- Administer content via the backend API (see `app.py`).

## Project Structure
```
UniverseTechGeek/
├── app.py                # Main Flask backend
├── requirements.txt      # Python dependencies
├── docker-compose.yml    # Docker Compose config
├── Dockerfile            # Docker build file
├── api/                  # JSON data for media
├── assets/               # CSS and images
├── JS/                   # JavaScript modules
├── pages/                # HTML pages
├── database/             # SQLite DB storage
├── seed/                 # Data seeding scripts
└── contact/              # Contact page
```

## Contributors
- **Business Analyst:** Nathalia
- **IT Operation:** Luara
- **Full-Stack Developer:** Robson Henrique

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact
For questions or support, please contact the project team via the contact page or open an issue.
