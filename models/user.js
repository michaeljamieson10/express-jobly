const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../helpers/expressError");


/** User class for message.ly */

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]);
    let user = result.rows[0];

  return user && await bcrypt.compare(password, user.password);
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      "SELECT username, first_name, last_name, phone FROM users ORDER BY username");
    return result.rows;
  }

  /** Get: get user by username 
   
   * returns username,
                first_name,
                last_name,
                email,
                photo_url
   *         
   *  */

  static async get(username) {
    const result = await db.query(
        `SELECT username,
                first_name,
                last_name,
                email,
                photo_url
                
            FROM users
            WHERE username = $1`,
        [username]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }

    return result.rows[0];
    // return [username]
  }
  static async patch(table, items, key, id) {
    // keep track of item indexes
    // store all the columns we want to update and associate with vals
  
    let idx = 1;
    let columns = [];
  
    // filter out keys that start with "_" -- we don't want these in DB
    for (let key in items) {
      if (key.startsWith("_")) {
        delete items[key];
      }
    }
  
    for (let column in items) {
      columns.push(`${column}=$${idx}`);
      idx += 1;
    }
  
    // build query
    let cols = columns.join(", ");
    let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING username, first_name, last_name, email, photo_url, is_admin `;
  
    let values = Object.values(items);
    values.push(id);
    const result = await db.query(query, values);
    return result.rows[0]
    // return {query, values}
  }
  
}


module.exports = User;