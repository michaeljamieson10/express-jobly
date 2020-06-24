process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Jobs  = require("../../models/Jobs");
const Methods  = require("../../models/methods");
const bcrypt = require("bcrypt")
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
    // let result = 
    await db.query(
        `INSERT INTO
         companies (handle, name, num_employees, description, logo_url)
            VALUES ('apples', 'macs', 5000, 'Maker of apple products', 'urltext')
            RETURNING handle, name, num_employees, description, logo_url;`)
    // testCompany = result.rows[0]
    let result2 = await db.query(
        `INSERT INTO
         jobs (title, salary, equity, company_handle)
         VALUES ('Engineer', 100000.00, 500, 'apples');`)
    // testJob = result2.rows[0]
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
describe("POST /jobs", async function () {
    test("Creates a new job", async function () {
      const response = await request(app)
          .post(`/jobs`)
          .send({
            _token: testAdminToken,
            company_handle: "apples",
            title: "Webdever",
            salary: 1000000,
            equity: 3000
          });
      expect(response.statusCode).toBe(201);
      expect(response.body.job).toHaveProperty("id");
    });
  
    // test("Prevents creating a job without required title field", async function () {
    //   const response = await request(app)
    //       .post(`/jobs`)
    //       .send({
    //         _token: TEST_DATA.userToken,
    //         salary: 1000000,
    //         equity: 0.2,
    //         company_handle: TEST_DATA.currentCompany.handle
    //       });
    //   expect(response.statusCode).toBe(400);
    // });
  });

describe("GET /jobs get jobs",  () => {
    test("GET job in db", async () => {
        const response = await request(app)
            .get(`/jobs`)
            .send({_token: testUserToken});
        expect(response.statusCode).toEqual(200); 
        expect(response.body.job).toEqual([{ title: 'Engineer', company_handle: 'apples' }]);

    })
    test("GET specific company without correct token", async () => {
        const response = await request(app)
            .get(`/jobs`)
            .send({_token: 'baddata'});
        expect(response.statusCode).toEqual(401); 

    })
    test("GET jobs?search in db", async () => {
        const response = await request(app)
            .get(`/jobs?search=engineer`)
            .send({_token: testUserToken});
            expect(response.statusCode).toEqual(200);
        expect(response.body.job).toHaveLength(1);
        // expect(response.body).toEqual({ jobs: [ { handle: 'apples', name: 'macs' } ] });

    })
}) 
describe("GET /jobs/:id specific job with id",  () => {
    test("GET specific job", async () => {
        
        const response = await request(app)
            .get("/jobs/1")
            .send({_token: testUserToken});
        console.log(response.body, " <---- Inside job/:id")
        expect(response.statusCode).toEqual(200); 

    })
    test("GET /jobs/:id with bad data", async () => {
        const response = await request(app)
            .get(`/jobs/1`)
            .send({_token: 'baddata'});
        // expect(1).toBe(1); 
        
        expect(response.statusCode).toEqual(401); 

    })
}) 

describe("PATCH /company create a company",  () => {
    test("PATCH  with admin token and data updates, gives 200 response", async () => {
        const response = await request(app)
            .patch(`/jobs/1`)
            .send({_token: testAdminToken,
            "title": "Jansistor",
            "salary": 85000.00,
            "equity": 150,
            "company_handle": "apples"
            });
            console.log(response.body)
        // expect(response.body).toEqual({
        //     handle: 'Windows',
        //     name: 'Bill Gates',
        //     num_employees: 5000,
        //     description: 'maker of microsoft',
        //     logo_url: 'somelogourl'
        //   })
        expect(response.statusCode).toBe(200); 

    })
    // test("PATCH  with admin token and data updates to give error because schema, gives response", async () => {
//         const response = await request(app)
//             .patch(`/companies/apples`)
//             .send({_token: testAdminToken,
//                 "handle": "Windows",
//                 "name": "Bill Gates",
//                 "num_employees": 5000,
//                 "description": "maker of microsoft",
//                 "logo_urls": "somelogourl"
//             });
//         expect(response.statusCode).toBe(400); 

    // })

}) 
describe("DELETE /job create a job",  () => {
    test("DELETE with admin token and data updates, gives 200 response", async () => {
        const response = await request(app)
            .delete(`/jobs/1`)
            .send({_token: testAdminToken})
           ;
        expect(response.statusCode).toBe(200); 
    })
    test("DELETE without admin token and data updates, gives 401 response", async () => {
        const response = await request(app)
            .delete(`/jobs/1`)
            .send({_token: "baddata"})
           ;
        expect(response.statusCode).toBe(401); 
    })
}) 