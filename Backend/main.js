const express = require('express');
const dotenv = require('dotenv');
const { pool } = require("./db");
const cors = require('cors');
const authenticateUser = require("./utility/authMiddleware");
const { createTables } = require('./db');
const { seedDatabase } = require('./db');
const { generateToken, hashPassword, comparePasswords } = require("./utility/auth");


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await pool.connect();
    await createTables();
    await seedDatabase();
    console.log(` Server running at ${PORT}`);
});

app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
            [username, email, hashedPassword]
        );

        const token = generateToken(newUser.rows[0]);
        res.status(201).json({ user: newUser.rows[0], token });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = userQuery.rows[0];

        const isMatch = await comparePasswords(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/books", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM books");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/books/:id", async (req, res) => {
    try {
        const bookId = req.params.id;

        const bookQuery = await pool.query("SELECT * FROM books WHERE id = $1", [bookId]);
        if (bookQuery.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        const book = bookQuery.rows[0];

        const reviewsQuery = await pool.query(
            `SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at, users.username
             FROM reviews
             JOIN users ON reviews.user_id = users.id
             WHERE reviews.book_id = $1`,
            [bookId]
        );
        const reviews = reviewsQuery.rows;

        for (let review of reviews) {
            const commentsQuery = await pool.query(
                `SELECT comments.id, comments.comment_text, comments.created_at, users.username
                 FROM comments
                 JOIN users ON comments.user_id = users.id
                 WHERE comments.review_id = $1`,
                [review.id]
            );
            review.comments = commentsQuery.rows;
        }

        res.json({ book, reviews });
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/reviews/:id", authenticateUser, async (req, res) => {
    try {
        const reviewId = req.params.id;

        const reviewQuery = await pool.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
        if (reviewQuery.rows.length === 0) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (reviewQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You are not allowed to delete this review" });
        }

        await pool.query("DELETE FROM reviews WHERE id = $1", [reviewId]);

        res.json({ message: "Review and related comments deleted successfully." });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/comments/:id", authenticateUser, async (req, res) => {
    try {
        const commentId = req.params.id;

        const commentQuery = await pool.query("SELECT * FROM comments WHERE id = $1", [commentId]);
        if (commentQuery.rows.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }

        console.log(req.user)

        if (commentQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You are not allowed to delete this comment" });
        }
        console.log("deleteAttempted")
        await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

        res.json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/api/reviews/:id", authenticateUser, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, review_text } = req.body;

        const reviewQuery = await pool.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
        if (reviewQuery.rows.length === 0) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (reviewQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You are not allowed to edit this review" });
        }

        const updatedReview = await pool.query(
            "UPDATE reviews SET rating = $1, review_text = $2 WHERE id = $3 RETURNING *",
            [rating, review_text, reviewId]
        );

        res.json({ message: "Review updated successfully", review: updatedReview.rows[0] });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/api/comments/:id", authenticateUser, async (req, res) => {
    try {
        const commentId = req.params.id;
        const { comment_text } = req.body;

        const commentQuery = await pool.query("SELECT * FROM comments WHERE id = $1", [commentId]);
        if (commentQuery.rows.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (commentQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "You are not allowed to edit this comment" });
        }

        const updatedComment = await pool.query(
            "UPDATE comments SET comment_text = $1 WHERE id = $2 RETURNING *",
            [comment_text, commentId]
        );

        res.json({ message: "Comment updated successfully", comment: updatedComment.rows[0] });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/reviews", authenticateUser, async (req, res) => {
    try {
        const { book_id, user_id, rating, review_text } = req.body;

        if (!book_id || !user_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Invalid input. Please provide a valid book_id, user_id, and rating (1-5)." });
        }

        const newReview = await pool.query(
            `INSERT INTO reviews (book_id, user_id, rating, review_text, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [book_id, user_id, rating, review_text]
        );

        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/comments", authenticateUser, async (req, res) => {
    try {
        const { review_id, user_id, comment_text } = req.body;

        if (!review_id || !user_id || !comment_text) {
            return res.status(400).json({ error: "Invalid input. Please provide review_id, user_id, and comment_text." });
        }

        const newComment = await pool.query(
            `INSERT INTO comments (review_id, user_id, comment_text, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [review_id, user_id, comment_text]
        );

        res.status(201).json(newComment.rows[0]);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/me", authenticateUser, async (req, res) => {
    try {

        res.status(201).json(req.user);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});