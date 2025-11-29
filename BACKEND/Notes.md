# BACK END using nodejs express along with the navicat IDE for databases

# FEATURES DONE
1. Login/Register - only lacks password validation
2. Forgot Password with SMTP OTP - need to create new gmail to look professional
3. Dashboard - only lacks fetching data for notification
4. 

# WHAT IS ADDED?
- I added dependencies and packages for backend
- I add node_modules (please don't alter the files in there)
- I added package-lock.json for the mysql2
- I added package.json 
- installed nodemon for server
- installed express5 for framework where I store all my api's
- installed cors for the security to block unknown server
- installed dotenv so that I will put all my pool there to prevent sensitive data in the app.js


# ERRORS / BUGS
- The page always says Cannot POST /login-register - 11/23/2025  -------- FIXED
- Bar Chart is not displaying the data of specific user - 11/23/2025 -------- FIXED
- Bar Chart logic is not working due to undefined variables and also repeating code block - 11/23/2025   ------- FIXED
- Login don't have a condition for gmail it accept any like @a.com or @akfsak.com - 11/23/2025
- Bar Chart does not show farm expenses but it appears to be displaying feed expenses in backend ----- FIXED DURING TESTING
- Total in the Pie chart does not concatenate ----- FIXED DURING TESTING
- Pie chart won't show the breakdown instead it shows all in feeds ----- FIXED DURING TESTING
-


# TO DO LISTS

- Notification should be able to fetch data from the reminders
- Integrate backend logic for Reminders
- Integrate backedn logic  for expenses - this will be including CRUD !!!
- email should only recieve @gmail none other
- username should not store number
- condition for 8 characters 1 special and 1 uppercase (password)

--------SUMMARY FOR EXPENSES-------------------
- Add Estimated_income logic and integrate to front end
- Add Project Profit logic and integrate to front end
- add breakdown logic and integrate it 
- Add logic for creating expenses
- add logic for deleting and updating expenses
- add logic for filtering the tables and chart monthly and yearly

# WHAT WAS DONE? ( DESCRIPTION )
- Done With the logic for the login and successful message in the login page
- Done With the logic for the Sign up and successful message in the register page, also it will redirect to    login page
- Preventing SQL done I added parameters on the logical
- also added cors to prevent user from entering a specific url it will block the user
- done with the password hashed when creating account password also installed 

- done with connecting the login to the dashboard
- done with the backend logic for statistics count
- done with merging the logic for statisctics count
- done with the backend logic for Chart
- done with merging the logic for chart

- done with the OTP for forget password using SMTP (nodemailer.js)
- done wtih the statistic count for each user
- done with fixing of the chart and also done with integrating the new chart which is the 

- Added farm logic for adding farms
- added pigs logic for adding 
- done with the bar chart in expenses in expenses reports
- done with the PIG sold and Expense table in expense reports

 

# CHANGES 
- I change the API instead of /login-register I change it into /login for login and /register for register because it's the url of each pages
- password length from 50 to 255 to integrate bcrypt
- I clean the backend codes and segregate it -- folders Controllers for all logic, Middleware is for error handling and other, and routes
- I change the condition in the total expenses count (excluded the sold)

# WHAT IS NEED TO BE CHANGE
- Change the alert into a modern success message
- Breakdown the farm expenses

# SECURITY CHECK (To be done by another programmer)
-