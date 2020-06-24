const db = require("../../db");
const partialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  // it("should generate a proper partial update query with just 1 field",
  // sqlForPartialUpdate () {

    // FIXME: write real tests!
    test("can create a query string into db", function () {
      const items = {
         'name': 'jacker'
      }

     const response = partialUpdate('companies', items, 'handle', 'apple');
     expect(response.values[0]).toBe('jacker');
     expect(response.values[1]).toBe('apple');
     expect(response.query).toBe('UPDATE companies SET name=$1 WHERE handle=$2 RETURNING *')
      // handle text PRIMARY KEY,
      // name text NOT NULL UNIQUE,
      // num_employees integer,
      // description text,
      // logo_url text
    
  });
});
