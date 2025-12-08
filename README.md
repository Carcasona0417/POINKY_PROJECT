# POINKY_PROJECT ( in FRONTEND folder open mini-capstone folder )

# SYSTEM INTRODUCTION
Farmers and pig owners often find it difficult to monitor and manage their incomes, expenses, Buying feeds schedules, vaccination records, and growth records manually. Traditional notebooks and physical logs are prone to loss or inaccuracy, and there is no centralized platform to track the stock of feeds, vaccination schedules, and pig conditions in real time.

The Poinky App aims to provide an organized and digital solution where users can monitor stock of feeds, log vaccination schedules, record weight and growth progress, and receive timely notifications, all in one friendly interface. The web redesign extends these functions to desktops for easier access and data visualization.

🚀 Features

🐖 Pig management (add, edit, delete, view details)

💉 Vaccination and health record tracking

💰 Expense and profit computation

⏰ Reminder and notification system

📊 Reports and analytics view

🧑‍🌾 Multi-farm management

🔒 Secure login & registration


🧰 Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: Node.js / Express.js 
Database: MySQL
Other Tools:
    Font Awesome (icons)
    Chart.js or Recharts (for graphs, if used)
    SweetAlert
    Cors

# INSTALLATION

# 1. Clone the repository
git clone https://github.com/Carcasona0417/POINKY_PROJECT.git

# 2. Navigate to the project folder
cd POINKY_PROJECT

# 3. Install dependencies
npm install

# 4. Import the database
# (Use poinky_db.sql located in /sql)

# 5. Run the project
npm start


# HOW TO USE? 
 - Go to the site 
 - Register your account or Login existing account
 - Go to farm and click the + button to add farm (farm1 - farm999) is the default you can double click it to change the farm name
 - Click the add pigs andd PigName or Serial ID, Enter Breed, Age, Date Acquired, and initial weight.
 - Click the name of the specific pig to view full details
 - Next is in the pig details there's expenses, weight, and vaccination records
 - Add weight to see progress of your pig insert image to see
 - Add expenses to keep track of the expense of that specific pig
 - Add vaccination record to do for that pig on a specific date
 - Next is you can change the status of pig
 - IF change status to sold either bulk or not input the price market of per kilo
 - See reciept for your profits

 - Go to expenses & reports to view your expenses and profit
 - click add expenses to directly add there and you will be directed to add form input what is asked
 - next is editing expenses full list table
 - click edit button to edit a pigs price of expenses
 - click delete to delete that expense
 - next is sold table click edit or cancel
 - edit is to edit the price and what date it was sold ( for typos or incorrect inputs)
 - cancel to cancel the sold pigs and it will be back to To Sale status

 - Go to reminders 
 - In reminders since you added vaccine records it will automarically added there to keep you reminded
 - Next is Edit reminders or delete
 - edit reminders edit the category and date when
 - delete to delete reminders

 - Notification 
 - In notification you can delete the notification read and unread
 - notification is basically automatic when the Date is only 3 days left
 
 - Profile settings next to notification
 - Edit your Username and email
 - Also change the password of your account



# WARNING DO NOT INSTALL IF YOU DON'T KNOW HOW TO ASK FOR EXPERTS
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


# GROUP MEMBERS
1. Mecah May Nicole Geroche - UI/UX
2. Ma. Scarlette P. Sanoy - DATABASE DESIGNER
3. Domingo Delos Angeles Anam - FRONT-END DEVELOPER
4. Oskar Jene T. Carcasona - BACKEND-DEVELOPER
5. Michael M. Adlawan - QA / Security checking and Validation checking
6. Allen Ivan Ortega - QA / User Tester

# CONTACT US ON
Email: poinkycompany@gmail.com 
Contact No. 09917195950 
