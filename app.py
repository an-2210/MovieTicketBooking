from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import pymysql

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production
jwt = JWTManager(app)
CORS(app)
def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="your_mysql_password",
        database="movie_booking",
        cursorclass=pymysql.cursors.DictCursor
    )

import bcrypt

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    role = data['role']

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password, role) VALUES (%s, %s, %s)", (username, password, role))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except pymysql.err.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        access_token = create_access_token(identity={"id": user['id'], "role": user['role']})
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
    
@app.route('/movies', methods=['GET'])
def get_movies():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies")
    movies = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(movies)
@app.route('/book', methods=['POST'])
@jwt_required()
def book_ticket():
    data = request.json
    user_id = get_jwt_identity()["id"]
    show_id = data['show_id']
    seats = data['seats']

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get show details
    cursor.execute("SELECT * FROM shows WHERE id=%s", (show_id,))
    show = cursor.fetchone()
    
    if not show or show['available_seats'] < seats:
        return jsonify({"error": "Not enough seats available"}), 400

    # Apply dynamic pricing
    price = show['base_price']
    if show['available_seats'] / 100 < 0.3:
        price *= 1.3  # 30% increase if >70% seats booked
    if seats > 5:
        price *= 0.9  # 10% discount for bulk booking

    total_price = price * seats

    # Update seats
    cursor.execute("UPDATE shows SET available_seats = available_seats - %s WHERE id=%s", (seats, show_id))

    # Insert booking
    cursor.execute("INSERT INTO bookings (user_id, show_id, seats_booked, total_price) VALUES (%s, %s, %s, %s)", 
                   (user_id, show_id, seats, total_price))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Booking successful", "total_price": total_price}), 201