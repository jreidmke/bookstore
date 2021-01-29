\c books-test

DROP TABLE IF EXISTS books;

CREATE TABLE books (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT, 
  year INTEGER
);

INSERT INTO books(isbn, amazon_url, author, language, pages, publisher,title, year)
VALUES('FK878SDF', 'amazon.com', 'James Reid', 'english', 420, 'Reid Books', 'The Book', 1956);