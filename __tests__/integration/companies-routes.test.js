process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const bcrypt = require("bcrypt")
const BCRYPT_WORK_FACTOR = 1;
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config")

let testCompany;
let testUserToken;
let testAdminToken;

beforeEach(async function() {
    const hashedPassword = await bcrypt.hash(
        "secret", BCRYPT_WORK_FACTOR
    );
    await db.query(
        `INSERT INTO
         users (username, password, first_name, last_name, email, photo_url)
            VALUES ('test', $1,'michael', 'jamieson','mj123@gmail.com','photourl')
    `,[hashedPassword])

    // ---
    
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
    
    // ---
    const testUser = {username: "test"}
    testUserToken = jwt.sign(testUser, SECRET_KEY);
    let result = await db.query(
        `INSERT INTO
         companies (handle, name, num_employees, description, logo_url)
            VALUES ('apples', 'macs', 5000, 'Maker of apple products', 'urltext')
            RETURNING handle, name, num_employees, description, logo_url;`)
    testCompany = result.rows[0]
})
afterEach(async function(){
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM users`)
})
afterAll(async function(){
    await db.end()
})
describe("GET /company get company",  () => {
    test("GET companies in db", async () => {
        const response = await request(app)
            .get(`/companies`)
            .send({_token: testUserToken});
        expect(response.statusCode).toEqual(200); 
        expect(response.body).toEqual({ companies: [ { handle: 'apples', name: 'macs' } ] });

    })
    test("GET specific company without correct token", async () => {
        console.log(testCompany);
        const response = await request(app)
            .get(`/companies`)
            .send({_token: 'baddata'});
        expect(response.statusCode).toEqual(401); 

    })
    test("GET companies?search in db", async () => {
        const response = await request(app)
            .get(`/companies?search=macs`)
            .send({_token: testUserToken});
        expect(response.statusCode).toEqual(200); 
        expect(response.body.companies).toHaveLength(1);
        // expect(response.body).toEqual({ companies: [ { handle: 'apples', name: 'macs' } ] });

    })
}) 
describe("GET /company/:handle specific company with handle",  () => {
    test("GET specific company", async () => {
        const response = await request(app)
            .get(`/companies/apples`)
            .send({_token: testUserToken});
        // expect(1).toBe(1); 
        expect(response.body).toEqual({
            handle: 'apples',
            name: 'macs',
            num_employees: 5000,
            description: 'Maker of apple products',
            logo_url: 'urltext'
          });
        expect(response.statusCode).toEqual(200); 

    })
    test("GET specific company with bad data", async () => {
        const response = await request(app)
            .get(`/companies/apples`)
            .send({_token: 'baddata'});
        // expect(1).toBe(1); 
        
        expect(response.statusCode).toEqual(401); 

    })
}) 
describe("POST /company create a company",  () => {
    test("POST  with admin token and data creates, gives 201 response", async () => {
        const response = await request(app)
            .post(`/companies`)
            .send({_token: testAdminToken,
                "handle": "Windows",
                "name": "Bill Gates",
                "num_employees": 5000,
                "description": "maker of microsoft",
                "logo_url": "somelogourl"
            });
        expect(response.body).toEqual({
            handle: 'Windows',
            name: 'Bill Gates',
            num_employees: 5000,
            description: 'maker of microsoft',
            logo_url: 'somelogourl'
          })
        expect(response.statusCode).toBe(201); 

    })

}) 
describe("PATCH /company create a company",  () => {
    test("PATCH  with admin token and data updates, gives 200 response", async () => {
        const response = await request(app)
            .patch(`/companies/apples`)
            .send({_token: testAdminToken,
                "handle": "Windows",
                "name": "Bill Gates",
                "num_employees": 5000,
                "description": "maker of microsoft",
                "logo_url": "somelogourl"
            });
        expect(response.body).toEqual({
            handle: 'Windows',
            name: 'Bill Gates',
            num_employees: 5000,
            description: 'maker of microsoft',
            logo_url: 'somelogourl'
          })
        expect(response.statusCode).toBe(200); 

    })
    test("PATCH  with admin token and data updates to give error because schema, gives response", async () => {
        const response = await request(app)
            .patch(`/companies/apples`)
            .send({_token: testAdminToken,
                "handle": "Windows",
                "name": "Bill Gates",
                "num_employees": 5000,
                "description": "maker of microsoft",
                "logo_urls": "somelogourl"
            });
        expect(response.statusCode).toBe(400); 

    })

}) 
describe("DELETE /company create a company",  () => {
    test("DELETE with admin token and data updates, gives 200 response", async () => {
        const response = await request(app)
            .delete(`/companies/apples`)
            .send({_token: testAdminToken})
           ;
     
        expect(response.statusCode).toBe(200); 

    })
    test("DELETE without admin token and data updates, gives 401 response", async () => {
        const response = await request(app)
            .delete(`/companies/apples`)
            .send({_token: "baddata"})
           ;
     
        expect(response.statusCode).toBe(401); 

    })


}) 