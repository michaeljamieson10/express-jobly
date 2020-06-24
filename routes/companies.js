const express = require("express");
const router = new express.Router();
const Methods = require("../models/methods");
const Company = require('../models/companies');
const partialUpdate = require("../helpers/partialUpdate");
const {ensureLoggedIn, ensureCorrectUser, authRequired, adminRequired} = require("../middleware/auth");
const jsonschema = require("jsonschema");
const companiesPostSchema = require("../schemas/companiesPostSchema.json")
const companiesPatchSchema = require("../schemas/companiesPatchSchema.json")
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
router.get('/', authRequired, async function(req, res, next) {
    try {
      const companies = await Company.findAll(req.query);
      return res.json({ companies });
    } catch (err) {
      return next(err);
    }
  });

/** Post / -
 *
 This should create a new company and return the newly created company.

This should return JSON of {company: companyData}
 *
 **/
router.post('/',adminRequired, async (req, res, next) => {
    try{

        // const items = {
        //     "handle": "Windows",
        //     "name": "Bill Gates",
        //     "num_employees": 5000,
        //     "description": "maker of microsoft",
        //     "logo_url": "somelogourl"
        // }
        const result = jsonschema.validate(req.body, companiesPostSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.json(err)
        }
        const response = await Methods.create("companies", req.body)
        
        return res.status(201).json(response);
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

router.get('/:handle',authRequired, async (req, res, next) => {
    try{
        const { handle } = req.params;
        const items = {'handle': handle}
        const response = await Methods.get("companies",items)
        return res.json(response);
    } catch (e) {
        // return next(e)
    }

});
/** PATCH / -
 *
This should update an existing company and return the updated company.

This should return JSON of {company: companyData}
 *
 **/

router.patch('/:handle',adminRequired, async (req, res, next) => {
    try{
        const items = req.body;
        // const response = partialUpdate('companies', items, 'handle', 'apple')
        const result = jsonschema.validate(req.body, companiesPatchSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.status(400).json(err)
        }
        const response = await Methods.patch('companies', items, 'handle', req.params.handle)
        // const res = await db.query(response);
        return res.json(response)
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

router.delete('/:handle',adminRequired, async (req, res, next) => {
    try{
        const { handle } = req.params
        const response = await Methods.delete("companies",handle, 'handle')
        // const res = await Methods.delete()
        // return res.json(res)
        return res.json(response)
        // return res.json('work this is handle');
    } catch (e) {
        return next(e)
    }

});

module.exports = router;