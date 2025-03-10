# MovieTicketBooking
A Node.js + Express + MySQL API for booking movie tickets. It includes User Authentication, Movie & Show Management, Dynamic Pricing, and Role-Based Access (Users & Theater Owners).

📌 Features
✅ User Registration & Authentication (JWT)
✅ Movie & Show Management (Theater Owners)
✅ Dynamic Pricing (Based on demand & time)
✅ Role-Based Access (Users & Theater Owners)
✅ Book & Manage Tickets

🚀 Tech Stack
Backend: Node.js, Express.js
Database: MySQL
Authentication: JSON Web Tokens (JWT)
API Testing: Postman
📂 Project Structure
graphql
Copy
Edit
movie-ticket-booking/
│── server.js            # Main server file  
│── db.js                # MySQL connection  
│── routes/              
│   ├── authRoutes.js    # User authentication  
│   ├── movieRoutes.js   # Movies API  
│   ├── showRoutes.js    # Shows API  
│   ├── bookingRoutes.js # Ticket Booking API  
│── models/             
│   ├── movieModel.js    # Movie schema  
│   ├── showModel.js     # Show schema  
│── .gitignore           # Ignored files  
│── package.json         # Project dependencies  
│── README.md            # Project documentation  
🛠️ Setup & Installation
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/your-username/movie-ticket-booking.git
cd movie-ticket-booking
2️⃣ Install Dependencies
sh
Copy
Edit
npm install
3️⃣ Setup MySQL Database
Run the following SQL queries to create tables:

sql
Copy
Edit
CREATE DATABASE movie_booking;
USE movie_booking;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'owner') DEFAULT 'user'
);

CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL
);

CREATE TABLE shows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    theater_name VARCHAR(255) NOT NULL,
    show_time DATETIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    tickets INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);
4️⃣ Configure Environment Variables
Create a .env file in your project root:

ini
Copy
Edit
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=movie_booking
JWT_SECRET=your_secret_key
5️⃣ Run the Server
sh
Copy
Edit
node server.js
Server will run at: http://127.0.0.1:4000

🎬 API Endpoints
🔹 User Authentication
Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Login and get JWT token
🔹 Movies API
Method	Endpoint	Description
POST	/movies	Add a new movie
GET	/movies	Get all movies
🔹 Shows API
Method	Endpoint	Description
POST	/shows	Add a new movie show
GET	/shows	Get all shows
🔹 Booking API
Method	Endpoint	Description
POST	/bookings	Book a ticket
GET	/bookings	View user bookings
