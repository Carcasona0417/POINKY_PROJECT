# BACK END using nodejs express along with the navicat IDE for databases

# WHAT IS ADDED?
- I added dependencies and packages for backend
- I add node_modules (please don't alter the files in there)
- I added package-lock.json for the mysql2
- I added package.json 
- installed nodemon for server
- installed express5 for framework where I store all my api's
- installed cors for the security to block unknown server
- installed dotenv so that I will put all my pool there to prevent sensitive data in the app.js

# ERRORS
- The page always says Cannot POST /login-register

# FIXED 
- Cannot POST has been fixed the error is in the Login-register.js missing path for env

# WHAT WAS DONE? ( DESCRIPTION )
- Done With the logic for the login and successful message in the login page
- Done With the logic for the Sign up and successful message in the register page, also it will redirect to    login page
- Preventing SQL done I added parameters on the logical
- also added cors to prevent user from entering a specific url it will block the user
- done with the password hashed when creating account password also installed bcrypt
- done with connecting the login to the dashboard
- done with the backend logic for statistics count
- done with merging the logic for statisctics count
- done with the backend logic for Chart
- done with merging the logic for chart

# CHANGES 
- I change the API instead of /login-register I change it into /login for login and /register for register
because it's the url of each pages
- password length from 50 to 255 to integrate bcrypt

# WHAT IS NEED TO BE CHANGE
- Change the alert into a modern success message

# TO DO LISTS
- OTP for forget password using SMTP
- Notification should be able to fetch data from the reminders
- add a logic where if the status of the pig is sold it will automatically change the category in the database into income


