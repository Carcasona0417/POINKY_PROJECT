# POINKY_PROJECT

MYSQL INSTALLATION GUIDE 
- https://dev.mysql.com/downloads/installer/ 
- Install mysql to the provided link install 558.3MB
- Watch this video to be guided https://youtu.be/AaISTiooIVU?si=CGb0Gqbu4Nn3pBJk
- Then on terminal inside VS STUDIO input these
- mysql -u root -p enter then input password
- then you will be redirected you can type Show databases; to display all databases
- then there's a user.sql file on the sql folder just copy and past it on the terminal
- if you have existing database then just type USE Databasename to enter that table
- then SELECT * from user so that you can see the data inside

ADD THIS PACKAGES, EXTENSIONS, AND DEPENDENCIES 

(probably won't need it because I already Uploaded the packages)

- if you are still in mysql just type exit

- npm init -y       => this is for the package.json
- npm i mysql2      => this is for additional libraries that will be used - package-lock.json
- npm i dotenv      => This is for .env file purpose is to reduce data risk
- npm i cors        => The purpose for this is to block unfamiliar host request
- npm install "express@5" => for the framework express this is where all the API POST will stored
- npm i -D nodemon  => this will run your server continouosly just type npm run dev
- npm i bcrypt      => for the hash to function (not integrated yet)

NOTES: If still error ask OSKAR :> 

Date created: 11/23/2025 - 2:54 AM