const express = require("express");
const router = new express.Router();
const Methods = require("../models/methods");
const Company = require('../models/companies');
const {authRequired, adminRequired} = require("../middleware/auth");
const jsonschema = require("jsonschema");
const companiesPostSchema = require("../schemas/companiesPostSchema.json")
const companiesPatchSchema = require("../schemas/companiesPatchSchema.json")
const ExpressError = require("../helpers/expressError");


/** GET / -
 *
 * This gets  a list of all companies you can search up company  and check min employee or max employee
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
        // takes data in the form of items below
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
This should return a single company found by its handle.

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
        return next(e)
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
        const result = jsonschema.validate(req.body, companiesPatchSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.status(400).json(err)
        }
        const response = await Methods.patch('companies', items, 'handle', req.params.handle)
        return res.json(response)
    } catch (e) {
        return next(e)
    }

});
/**  
 *
 *deletes company by getting handle of company from url string
 **/

router.delete('/:handle',adminRequired, async (req, res, next) => {
    try{
        const { handle } = req.params
        const response = await Methods.delete("companies",handle, 'handle')
        return res.json(response)
    } catch (e) {
        return next(e)
    }

});

module.exports = router;