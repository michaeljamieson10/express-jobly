const express = require("express");
const router = new express.Router();
const Methods = require("../models/methods");
const Jobs = require("../models/jobs");
const partialUpdate = require("../helpers/partialUpdate");
const jsonschema = require("jsonschema");
const jobPatchSchema = require("../schemas/jobPatchSchema.json")
const jobPostSchema = require("../schemas/jobPostSchema.json")
const {ensureLoggedIn, ensureCorrectUser, authRequired, adminRequired} = require("../middleware/auth");
const ExpressError = require("../helpers/expressError");

/** GET / -
 *
 * This should return the handle and name for all of the company objects. It should also allow for the following query string parameters
search. If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
min_employees. If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
max_employees. If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
If the min_employees parameter is greater than the max_employees parameter, respond with a 400 status and a message notifying that the parameters are incorrect.
This should return JSON of {companies: [companyData, ...]}
 *
 **/
router.get('/', authRequired,async (req, res, next) => {
    try{
        // const items = {
        //     'handle':
            //             name,
            //             num_employees,
            //             description,
            //             logo_url"
        // }
        const response = await Jobs.findAll(req.query)
        // Methods.create("jobs", items)
        return res.json({job: response})
    } catch (e) {
        // return next(e)
    }

});

/** Post / -
 *
 This should create a new company and return the newly created company.

This should return JSON of {company: companyData}
CREATE TABLE jobs (
    id SERIAL,
    title text NOT NULL,
    salary float NOT NULL,
    equity integer,
    company_handle TEXT REFERENCES companies (handle),
    date_posted TIMESTAMPTZ DEFAULT Now()
);


 *
 **/
router.post('/',adminRequired ,async (req, res, next) => {
    try{
        // const items = {
        //     "title": "Janitor",
        //     "salary": 85000.00,
        //     "equity": 150,
        //     "company_handle": "apple"
        // }
        const result = jsonschema.validate(req.body, jobPostSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.status(201).json(err)
        }
        
        const response = await Methods.create("jobs", req.body)
        
        return res.status(201).json({job: response})
    } catch (e) {
        return next(e)
    }

});

/** get handle / -
 *
This should return a single company found by its id.

This should return JSON of {company: companyData}
 *
 **/

router.get('/:id', authRequired, async (req, res, next) => {
    try{
        const { id } = req.params;
        const items = {'id': Number(id)}
        const response = await Methods.get("jobs",items)
        return res.json({job: response})
    } catch (e) {
        return next(e)
    }

});
/** PATCH / -
 *
This should update an existing company and return the updated company.

This should return JSON of {company: companyData}
 *
 **/

router.patch('/:id',adminRequired ,async (req, res, next) => {
    try{
        const items = req.body;
        // const response = partialUpdate('companies', items, 'id', 'apple')
        const result = jsonschema.validate(req.body, jobPatchSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.json(err)
        }
        
        const response = await Methods.patch('jobs', items, 'id', Number(req.params.id))
        // const res = await db.query(response);
        return res.json({job: response})
    } catch (e) {
        // return next(e)
    }

});
/**  
 *
PATCH /companies/[handle]
This should update an existing company and return the updated company.

This should return JSON of {company: companyData}
 *
 **/

// router.patch('/:handle', async (req, res, next) => {
//     try{
//         // const users = User.all()
//         // return res.json(users);
//     } catch (e) {
//         // return next(e)
//     }

// });
/**  
 *
DELETE /companies/[handle]
This should remove an existing company and return a message.

This should return JSON of {message: "Company deleted"}
 *
 **/

router.delete('/:id',adminRequired ,async (req, res, next) => {
    try{
        const { id } = req.params
        // const res = await Methods.remove("companies",id, 'id')
        const response = await Methods.delete('jobs', Number(id),'id')
        return res.json(response)
        // return res.json('work this is handle');
    } catch (e) {
        // return next(e)
    }

});

module.exports = router;