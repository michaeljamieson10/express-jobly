/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");



/** Message on the site. */

class Methods {

  static async all(table, items) { 
    let idx = 1;
    let columns = [];

    // filter out keys that start with "_" -- we don't want these in DB
    
    for (let key in items) {
      if (key.startsWith("_")) {
        delete items[key];
      }
    } 

    for (let column of items) {
      columns.push(`${column}`);
    }
    // build query
    let cols = columns.join(", ");
    const query = `SELECT ${cols} FROM ${table}`;
    const result = await db.query(query);
    return result.rows;
  }

  static async search(table, item, key, columnArr){
    let columns = [];
    for (let column of columnArr) {
      columns.push(`${column}`);
    }
    let cols = columns.join(", ");
    let query = `SELECT ${cols} FROM ${table} WHERE ${key} = $1`;
    const result = await db.query(query,[item])
    return result.rows
  }

  /** create new company -- returns
   *  //     "handle": "Windows",
        //     "name": "Bill Gates",
        //     "num_employees": 5000,
        //     "description": "maker of microsoft",
        //     "logo_url": "somelogourl"
   */

  static async create(table, items) {
    // keep track of item indexes
    // store all the columns we want to update and associate with vals
  
    let idx = 1;
    let idxArr = [];
    // idxArr.push(idx);
    let columns = [];

    // filter out keys that start with "_" -- we don't want these in DB
    
    for (let key in items) {
      if (key.startsWith("_")) {
        delete items[key];
      }
    }

    for (let column in items) {
      columns.push(`${column}`);
      idxArr.push(`$${idx}`);
      idx += 1;
    }
    
      // build query
    let cols = columns.join(", ");
    let idxs = idxArr.join(", ")
    let query = `INSERT INTO ${table} (${cols}) VALUES (${idxs}) RETURNING *`;
    let values = Object.values(items);
    //insert into db
    const result = await db.query(
        query, values
    );
    return result.rows[0];
//  return { query, values}
  }

  static async get(table, items) {

    let columnNew = "";

    for (let key in items) {
      if (key.startsWith("_")) {
        delete items[key];
      }
    }
    
    let values = Object.values(items);
    
    for (let column in items) {
      columnNew += column
    }
    // const res = await db.query(`SELECT * FROM ${table} WHERE ${columnNew} = $1`, values);
// 
    // if (res.rows.length === 0) {
      // throw { message: `There is no ${table} with a ${columnNew} of '${values}`, status: 404 }
    // }
// 
    // return res.rows[0];
    let query = `SELECT * FROM ${table} WHERE ${columnNew} = $1`;
    const response = await db.query(query, values)
    return response.rows[0];
    //  return { query, values}
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
    let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`;
  
    let values = Object.values(items);
    values.push(id);
    const result = await db.query(query, values);
    return result.rows[0]
    // return {query, values}
  }
  static async delete(table,value,key) {
    // return `DELETE FROM ${table} WHERE ${key} = $1`, value;
    const result = await db.query(`DELETE FROM ${table} WHERE ${key} = $1`, [value]);
    return `deleted ${table} ${value}`
    // let query = `DELETE FROM ${table} WHERE ${key} = $1`
    // return {query, value}
  }

  // static async register(table, items, key) {
  // username |  password   | first_name | last_name |      email      | photo_url | is_admin
  // }

  static async register({username, password, first_name, last_name, email, photo_url, is_admin}) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
        `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          email,
          photo_url,
          is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
      [username, hashedPassword, first_name, last_name, email, photo_url, is_admin]
      );
      
    return results.rows[0]
  }
  static async authenticate(username, password) {
    const result = await db.query(
        "SELECT username, password, is_admin FROM users WHERE username = $1",
        [username]);
    let user = result.rows[0];

    return user;
  }
  static async remove(table, items, key) {

    let columnNew = "";

    for (let key in items) {
      if (key.startsWith("_")) {
        delete items[key];
      }
    }
    
    let value = Object.values(items);
    
    for (let column in items) {
      columnNew += column
    }
    // const str = `DELETE FROM ${table} WHERE ${key} = $1`
    const res = await db.query(`DELETE FROM ${table} WHERE ${key} = $1`, value);


    return `${values} Deleted`


  }
}

  
module.exports = Methods;