# Run Node application
1. Open terminal and split it
2. On one of them execute "npm start" to run the node application
3. On the other one execute "tsc -w" to compile the Typescript code

# Install and run PostgreSQL on Debian distribution
1. Execute all the command from https://www.postgresql.org/download/linux/debian/ 
2. Also install "sudo apt-get -y install postgresql-contrib" 
3. Now we need to run the server in order to be able to connect to the database
   - 3.1. Execute "sudo systemctl enable postgresql"
   - 3.2. Execute "sudo -u postgres psql"
   - 3.3. Execute "sudo systemctl start postgresql"
   - 3.4. Execute "sudo systemctl status postgresql" to check the status
4. Open postgresql with "sudo -u postgres psql". From now on we will have the prefix "postgres=#" in the terminal.
5. Create user with "create user kali with password 'kali';"
6. Create database "create database securevault;"
7. Check list of databases "select datname from pg_database;"
8. Create table users
    - CREATE TABLE USERS (
        ID SERIAL PRIMARY KEY NOT NULL,
        USERNAME varchar(25) NOT NULL UNIQUE,
        PASSWORD varchar(255) NOT NULL,
        VERSIONTIME timestamp NULL,
        DATA varchar(255)NULL
    );

- Steps to connect postgresql with nodejs
    - https://www.youtube.com/watch?v=mltF9Qj0B_M 

# In order to visualize easier the database we are using DBeaver 
    https://dbeaver.io/download/

//TODO ADD SCHEMA ABOUT CONNECTION FROM NODE TO POSTGRESQL DATABABASE

//TODO ADD SCHEMA ABOUT CONNECTION FROM REACT APP TO NODE JS





