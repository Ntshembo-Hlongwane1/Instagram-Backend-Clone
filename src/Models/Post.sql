CREATE TABLE posts(
  media text[] NOT NULL,
  caption VARCHAR(50) NOT NULL,
  author VARCHAR(50) REFERENCES users(username),
  likes text[],
  comments json,
  id BIGSERIAL PRIMARY KEY NOT NULL
);