const db = require("../db");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");

class Company {
    /** Find all companies (can filter on terms in data). */
  
  static async findAll(data) {
    let baseQuery = `SELECT handle, name FROM companies`;
    let whereExpressions = [];
    let queryValues = [];
    let idx = 1;

    if(+data.max_employees < +data.min_employees){
        throw new ExpressError("Invalid ", 400);
    }

    if (data.min_employees){
        queryValues.push(data.min_employees)
        whereExpressions.push(`num_employees > $${idx}`)
        idx += 1
    }

    if (data.max_employees){
        queryValues.push(data.max_employees)
        whereExpressions.push(`num_employees <  $${idx}`)
        idx += 1
    }
    
    if (data.search){
        queryValues.push(data.search)
        whereExpressions.push(`name ILIKE $${idx}`)
        idx += 1
    }
    if (whereExpressions < 1 || queryValues < 1){
        const result = await db.query(
            baseQuery
        );
        return result.rows;
    } 
    const wExpressionsJ = whereExpressions.join(" AND ")
    const ans = baseQuery + ' WHERE ' + wExpressionsJ
    // const ans = baseQuery + ' WHERE ' + wExpressionsJ + queryValues
    //insert into db
    const result = await db.query(
        ans, queryValues
    );
    return result.rows;
    // return ans
  }
}
module.exports = Company;