CREATE TABLE users (
	id serial PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(255) NOT NULL,
	created_at DATE NOT NULL,
);

CREATE TABLE artists (
	id serial PRIMARY KEY,
    user_id INT,
	artist_name VARCHAR(100),
	tagline VARCHAR(255) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tracks (
	id serial PRIMARY KEY,
	artist_id INT NOT NULL,
	name VARCHAR(255) NOT NULL,
	isrc VARCHAR(12),
	FOREIGN KEY (artist_id) REFERENCES artists (id)
);

(* Solution *) 
SELECT 
    user_id, 
    username, email, 
    artist_id, tagline, 
    name AS track_name, 
    isrc AS track_isrc 
FROM artists 
JOIN users ON artists.user_id = users.id 
JOIN tracks ON tracks.artist_id = artists.id ;; 