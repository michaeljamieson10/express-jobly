process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt");
const BCRYPT_WORK_FACTOR = 1;
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config")

let testCompany;
let testUserToken;
let testAdminToken;
let testJob;

beforeEach(async function() {
    const hashedPassword = await bcrypt.hash(
        "secret", BCRYPT_WORK_FACTOR
    );
    await db.query(
        `INSERT INTO
         users (username, password, first_name, last_name, email, photo_url)
            VALUES ('test', $1,'michael', 'jamieson','mj123@gmail.com','photourl')
    `,[hashedPassword])

    
    const hashedPassword2 = await bcrypt.hash(
        "secret", BCRYPT_WORK_FACTOR
    );
    await db.query(
        `INSERT INTO
         users (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ('testAdmin', $1,'michael', 'jamieson','mj123@gmail.com','photourl', $2)
    `,[hashedPassword2, true])
    const testAdmin = {username: "testAdmin", is_admin:true}
    testAdminToken = jwt.sign(testAdmin, SECRET_KEY);
    
    const testUser = {username: "test"};
    testUserToken = jwt.sign(testUser, SECRET_KEY);
    await db.query(
        `INSERT INTO
         companies (handle, name, num_employees, description, logo_url)
            VALUES ('apples', 'macs', 5000, 'Maker of apple products', 'urltext')
            RETURNING handle, name, num_employees, description, logo_url;`);
    let result2 = await db.query(
        `INSERT INTO
         jobs (title, salary, equity, company_handle)
         VALUES ('Engineer', 100000.00, 500, 'apples');`);
})
afterEach(async function(){
    try {
        await db.query('DELETE FROM jobs');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM companies');
      } catch (error) {
        console.error(error);
      }
    })
afterAll(async function(){
    try {
    await db.end()
    }catch (error) {
        console.error(error);
      }
})
describe("POST /users", async function () {
    test("Creates a new user", async function () {
      const response = await request(app)
          .post(`/users`)
          .send({
            "username": "josh1337",
            "password": "password123",
            "first_name": "josh",
            "last_name": "jackson",
            "email": "email@email.com",
            "photo_url": "photourl",
            "is_admin": true
        });
        
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ token: expect.any(String) });
    });
  });

describe("GET /users get users",  () => {
    test("GET user in db", async () => {
        const response = await request(app)
            .get(`/users`);
           
        
        expect(response.statusCode).toEqual(200); 
        expect(response.body).toEqual( [
            {
              username: 'test',
              first_name: 'michael',
              last_name: 'jamieson',
              email: 'mj123@gmail.com'
            },
            {
              username: 'testAdmin',
              first_name: 'michael',
              last_name: 'jamieson',
              email: 'mj123@gmail.com'
            }
          ]);

    })
    
}) 
describe("GET /users/:username specific job with id",  () => {
    test("GET user data NOT PASSWORD everything else", async () => {
        
        const response = await request(app)
            .get("/users/test")
            .send({_token: testUserToken});
        
        expect(response.statusCode).toEqual(200); 

    })
  
}) 

describe("PATCH /user/:username create a user/:username",  () => {
    test("PATCH  , gives 200 response", async () => {
        const response = await request(app)
            .patch(`/users/test`)
            .send({"_token": testUserToken,
            "first_name": "josh",
            "last_name": "jackson",
            "email": "email@email.com",
            "photo_url": "photourl",
            "is_admin": true
        });
            
        expect(response.body).toEqual({
            "username": "test",
            "first_name": "josh",
            "last_name": "jackson",
            "email": "email@email.com",
            "photo_url": "photourl",
            "is_admin": true
        })
        expect(1).toBe(1); 
        expect(response.statusCode).toBe(200); 

    })
    test("PATCH  with admin token and data updates to give error because schema, gives response", async () => {
        const response = await request(app)
            .patch(`/users/test`)
            .send({"_token": testUserToken,
            "first_namseeee": "josh",
            "last_name": "jackson",
            "email": "email@email.com",
            "photo_url": "photourl",
            "is_admin": true
        });
        expect(response.statusCode).toBe(400); 

    })

}) 
describe("DELETE /users create a users",  () => {
    test("DELETE with admin token and data updates, gives 200 response", async () => {
        const response = await request(app)
            .delete(`/users/test`)
            .send({"_token": testUserToken})
           ;
        expect(response.statusCode).toBe(200); 
    })
    test("DELETE without admin token and data updates, gives 401 response", async () => {
        const response = await request(app)
            .delete(`/users/1`)
            .send({_token: "baddata"})
           ;
        expect(response.statusCode).toBe(401); 
    })
}) 