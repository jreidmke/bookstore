process.env.NODE_env = "test";

const request = require('supertest');

const app = require('../app');
const db = require('../db');

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO 
        books (isbn, amazon_url,author,language,pages,publisher,title,year)   
        VALUES(
          '123432122', 
          'https://amazon.com/taco', 
          'Elie', 
          'English', 
          100,  
          'Nothing publishers', 
          'my first book', 2008) 
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
  });

describe("GET /books", () => {
    test("returns list of books", async() => {
        const resp = await request(app).get('/books');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.books[0]).toHaveProperty('isbn');
        expect(resp.body.books[0]).toHaveProperty('author');
    })
})

describe("GET /books/:id", () => {
    test("returns book object by isbn num", async() => {
        const resp = await request(app).get('/books/123432122');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book).toHaveProperty('isbn');
        expect(resp.body.book).toHaveProperty('author');        
    });

    test("returns 404 with bad isbn", async() => {
        const resp = await request(app).get('/books/999');
        expect(resp.statusCode).toBe(404);
    })
});

describe("POST /books", () => {
    test("adds book to db and returns new book object", async() => {
        const resp = await request(app).post('/books').send(
            {
                isbn: '32794782',
                amazon_url: "https://taco.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "amazing times",
                year: 2000
              }
        );
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book).toHaveProperty('isbn');
        
        const getResp = await request(app).get('/books/32794782');
        expect(getResp.statusCode).toBe(200);
        expect(getResp.body.book).toHaveProperty('isbn');
        expect(getResp.body.book).toHaveProperty('author');
    });
    
    test("prevents addition of book with invalid JSON", async() => {
        const resp = await request(app).post('/books').send(
            {
                isbn: '12345'
            }
        );
        expect(resp.statusCode).toBe(400);
    })
})

describe("PUT /books/:isbn", () => {
    test("updates data on selected book", async() => {
        const resp = await request(app).put('/books/123432122').send({
            title: "my second book"
        });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book).toHaveProperty('isbn');

        const getResp = await request(app).get('/books/123432122');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book).toHaveProperty('isbn'); 
    });

    test("forbids user from attempting to update book isbn", async() => {
        const resp = await request(app).put('/books/123432122').send({
            isbn: "123456789"
        });
        expect(resp.statusCode).toBe(400);
    })
});

describe("DELETE /books/:isbn", () => {
    test("deletes book from db and returns delete message", async() => {
        const resp = await request(app).delete('/books/123432122');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.message).toBe("Book deleted");
    });
    
    test("returns 404 with invalid book isbn", async() => {
        const resp = await request(app).delete("/books/abc");
        expect(resp.statusCode).toBe(404);
    })
})

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });