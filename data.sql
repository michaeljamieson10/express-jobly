DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);
-- id: a primary key that is an auto incrementing integer
-- title: a non-nullable column
-- salary a non-nullable floating point column
-- equity: a non-nullable column that is a float. For example, 0.5 equity represents 50% in a company. Ensure that you have a constraint that does not allow for equity to be greater than 1 when created.
-- company_handle: a column which is a foreign key to the handle column
-- date_posted: a datetime column that defaults to whenever the row is created

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity integer,
    company_handle TEXT REFERENCES companies (handle),
    date_posted TIMESTAMPTZ DEFAULT Now()
);

-- FOREIGN KEY (company_handle) REFERENCES companies (handle),

-- username: a primary key that is text
-- password: a non-nullable column
-- first_name: a non-nullable column
-- last_name: a non-nullable column
-- email: a non-nullable column that is and unique
-- photo_url: a column that is text
-- is_admin: a column that is not null, boolean and defaults to false

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT false
);

-- INSERT INTO companies (handle, name, num_employees, description, logo_url)
--     VALUES ('apple', 'mac', 5000, 'Maker of apple products', 'urltext');

-- INSERT INTO companies (handle, name, num_employees, description, logo_url)
--     VALUES ('backyardcomp', 'lawn services', 2000, 'Cuts your lawn', 'urltext');

-- INSERT INTO companies (handle, name, num_employees, description, logo_url)
--     VALUES ('TESLA', 'Electric vehicles', 100000, 'Creates electric vehicles', 'urltext');

-- INSERT INTO jobs (title, salary, equity, company_handle)
--     VALUES ('Engineer', 100000.00, 500, 'apples');

-- INSERT INTO users (username, password, first_name, last_name, email, photo_url)
--     VALUES ('michaelj', 'password123','michael', 'jamieson','mj123@gmail.com','photourl');