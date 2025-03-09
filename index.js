require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Anweshalaha2020',
    database: "movieticket"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// Secret Key for JWT
const SECRET_KEY = "your_secret_key";
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role || "user"],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User registered successfully!" });
        });
});
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, users) => {
        if (err || users.length === 0) return res.status(400).json({ message: "User not found" });

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});
app.post("/movies", (req, res) => {
    const { title, genre, id } = req.body;
    db.query("INSERT INTO movies (title, genre) VALUES (?, ?, ?)", [title, genre],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Movie added!" });
        });
});
app.post("/shows", (req, res) => {
    const { movie_id, theater_name, show_time, base_price, seats_available } = req.body;
    db.query("INSERT INTO shows (movie_id, theatre_name, showtime, base_price, available_seats) VALUES (?, ?, ?, ?, ?)",
        [movie_id, theater_name, show_time, base_price, seats_available],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Show added!" });
        });
});
app.post("/book-ticket", (req, res) => {
    const { user_id, show_id, seats } = req.body;

    db.query("SELECT base_price, seats_available FROM shows WHERE id = ?", [show_id], (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ message: "Show not found" });

        const show = results[0];
        if (show.seats_available < seats) return res.status(400).json({ message: "Not enough seats available" });

        // Dynamic Pricing Logic
        let final_price = show.base_price;
        if (show.seats_available <= 5) final_price *= 1.3; // 30% price increase for last 5 seats

        const total_price = final_price * seats;

        // Save Booking & Update Seats
        db.query("INSERT INTO bookings (user_id, show_id, seats, total_price) VALUES (?, ?, ?, ?)",
            [user_id, show_id, seats, total_price]);

        db.query("UPDATE shows SET seats_available = seats_available - ? WHERE id = ?", [seats, show_id]);

        res.json({ message: "Ticket booked!", total_price });
    });
});
app.get("/",(req,res)=>{
    res.send("Movie Ticket Booking API is running!");
});
app.get("/movies", (req, res) => {
    db.query("SELECT * FROM movies", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

const PORT = 4000;
app.listen(PORT,() => {
    console.log(`Server running on http:/127.0.0.1:${PORT}`);
});