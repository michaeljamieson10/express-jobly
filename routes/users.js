const express = require("express");
const router = new express.Router();
const Methods = require("../models/methods");
const User = require("../models/user");
const partialUpdate = require("../helpers/partialUpdate");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const bcrypt = require("bcrypt");
const {ensureLoggedIn, ensureCorrectUser, authRequired} = require("../middleware/auth");
const userPostSchema = require("../schemas/userPostSchema.json");
const userPatchSchema = require("../schemas/userPatchSchema.json");
const loginPostSchema = require("../schemas/loginPostSchema.json");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");

/** GET / -
 *
 * GET /users
This should return the username, first_name, last_name and email of the user objects.

This should return JSON: {users: [{username, first_name, last_name, email}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    try{
        // const {username, first_name, last_name, email} = req.body
        const items = ['username', 'first_name', 'last_name', 'email'];
        // const items
        // // const items = {
        // //     'handle':
        // //     //             name,
        // //     //             num_employees,
        // //     //             description,
        // //     //             logo_url"
        // // }
        const results = await Methods.all("users", items)
        return res.json(results)
    } catch (e) {
        // return next(e)
    }

});

/** Post / -
 *
 This should create a new company and return the newly created company.

 users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT false
);

This should return JSON of {user: userData}
 *
 **/
router.post('/', async (req, res, next) => {
    try{
        const {username, password, first_name, last_name, email, photo_url, is_admin} = req.body
        // const items = {
        //     "username": "josh1337",
        //     "password": "password123",
        //     "first_name": "josh",
        //     "last_name": "jackson",
        //     "email": "email@email.com",
        //     "photo_url": "photourl",
        //     "is_admin": true
        // }
        const result = jsonschema.validate(req.body, userPostSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.json(err)
        }
        
        const items = {username, password, first_name, last_name, email, photo_url, is_admin};
        const response = await Methods.create("users", items)
        
        return res.status(201).json(response);
    } catch (e) {
        return next(e)
    }

});
router.post('/login', async (req, res, next) => {
        // const items = {
        //     "username": "josh1337",
        //     "password": "password123",
        //     "first_name": "josh",
        //     "last_name": "jackson",
        //     "email": "email@email.com",
        //     "photo_url": "photourl",
        //     "is_admin": true
        // }
        // const response = await Methods.create("users", req.body)
        try {
            const result = jsonschema.validate(req.body, loginPostSchema)
            if (!result.valid){
                const listOfErrors = result.errors.map(e => e.stack)
                const err = new ExpressError(listOfErrors, 400)
                return res.json(err)
            }
            
            let {username, password} = req.body;
            const user = await Methods.authenticate(username, password);
            if (user && await bcrypt.compare(password, user.password)) {
                const is_admin = user.is_admin;
                let token = jwt.sign({username, is_admin}, SECRET_KEY);
                return res.json({token});
            } else {
              throw new ExpressError("Invalid username/password", 400);
            }
          }
        
          catch (err) {
            return next(err);
          }
 

});

/** get handle / -
 *
This should return a single company found by its id.

This should return JSON of {company: companyData}
 *
 **/

router.get('/:username', async (req, res, next) => {
    try{
        const { username } = req.params;
        // const items = {'username': username}
        const response = await User.get(username)
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

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
    try{
        const items = req.body;
        // const response = partialUpdate('companies', items, 'username', 'apple')
        const result = jsonschema.validate(req.body, userPatchSchema)
        if (!result.valid){
            const listOfErrors = result.errors.map(e => e.stack)
            const err = new ExpressError(listOfErrors, 400)
            return res.status(400).json(err)
        }
        
        const response = await User.patch('users', items, 'username', req.params.username)
        return res.json(response)
    } catch (e) {
        return next(e)
    }

});
/**  
 *

DELETE /companies/[handle]
This should remove an existing company and return a message.

This should return JSON of {message: "Company deleted"}
 *
 **/

router.delete('/:username',ensureCorrectUser , async (req, res, next) => {
    try{
        const { username } = req.params
        // const res = await Methods.remove("companies",username, 'username')
        const response = await Methods.delete('users',username,'username')
        return res.json(`Deleted ${username}`)
        // return res.json('work this is username');
    } catch (e) {
        return next(e)
    }

});

module.exports = router;