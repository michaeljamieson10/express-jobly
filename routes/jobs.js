const express = require("express");
const router = new express.Router();
const Methods = require("../models/methods");
const Jobs = require("../models/jobs");
const jsonschema = require("jsonschema");
const jobPatchSchema = require("../schemas/jobPatchSchema.json")
const jobPostSchema = require("../schemas/jobPostSchema.json")
const {authRequired, adminRequired} = require("../middleware/auth");
const ExpressError = require("../helpers/expressError");

/** GET / -
 *
 * This can search for a job, min equity of a job and max equity of a job in the url param
 * or if left without any params it will just return all jobs.
 *
 **/
router.get('/', authRequired,async (req, res, next) => {
    try{
        
        const response = await Jobs.findAll(req.query)
        
        return res.json({job: response})
    } catch (e) {
        return next(e)
    }

});

/** Post / -
 *
 This should create a a new job and give an id with auto incrementing
        data needed for post submit in insomnia
        const items = {
            "title": "Janitor",
            "salary": 85000.00,
            "equity": 150,
            "company_handle": "apple"
        }
 *
 **/
router.post('/',adminRequired ,async (req, res, next) => {
    try{
    
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
This should return a single job found by its id.

This should return JSON of job
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
        const result = jsonschema.validate(req.body, jobPatchSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.status(400).json(err)
        }
        
        const response = await Methods.patch('jobs', items, 'id', Number(req.params.id))
        return res.json({job: response})
    } catch (e) {
        return next(e)
    }

});
/**  
 *
DELETE /job/:id
This should remove an existing job

This should return JSON of {message: "Company deleted"}
 *
 **/

router.delete('/:id',adminRequired ,async (req, res, next) => {
    try{
        const { id } = req.params
        await Methods.delete('jobs', Number(id),'id')
        return res.json({message: "Job deleted"})
    } catch (e) {
        return next(e)
    }

});

module.exports = router;