const db = require("../db");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");

class Jobs {
    /** Find all companies (can filter on terms in data). */
    static async findAll(data) {
        let baseQuery = `SELECT title, company_handle FROM jobs`;
        let whereExpressions = [];
        let queryValues = [];
        let idx = 1;
        
        if (data.min_salary || data.min_equity || data.search){
            baseQuery += " WHERE "
        }

        if (data.min_salary){
            queryValues.push(data.min_salary)
            whereExpressions.push(`salary > $${idx}`)
            idx += 1
        }
    
        if (data.min_equity){
            queryValues.push(data.min_equity)
            whereExpressions.push(`equity > $${idx}`)
            idx += 1
        }
        
        if (data.search){
            queryValues.push(data.search)
            whereExpressions.push(`title ILIKE $${idx}`)
            idx += 1
        }
        const wExpressionsJ = whereExpressions.join(" AND ")
        const ans = baseQuery + wExpressionsJ
        // insert into db
        const result = await db.query(
            ans, queryValues
        );
        return result.rows;
        // return [ans, queryValues]
      }
 
}
module.exports = Jobs;