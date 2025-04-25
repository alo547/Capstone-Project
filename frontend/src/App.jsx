import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import SingleBooks from "./components/SingleBooks";
import './components/index.css';
import './components/general.css';

function App() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [token, setToken] = useState(localStorage.getItem("token"));
    const apiURL = process.env.NODE_ENV === "production" ? "https://capstone-project-f4ao.onrender.com/": process.env.REACT_APP_API_BASE_URL

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${apiURL}/api/me`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            setUser(data);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${apiURL}/api/books`);
                const data = await response.json();
                setBooks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };

        fetchBooks();
        fetchUserInfo();
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        window.location.href = "/login";
    };

    return (
        <Router>

            <nav className="bg-indigo-600 text-white shadow-md py-4 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold hover:text-amber-300 transition">
                        BookHaven 📚
                    </Link>
                    <input type="text" placeholder="Search Books" value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-32 focus:w-64 transition-all duration-300 bg-indigo-500 hover:bg-indigo-400 focus:bg-white focus:text-black placeholder-white hover:placeholder-amber-200 rounded-md px-3 py-1 outline-none shadow-sm" />
                    <div className="space-x-4">
                        {token ? (
                            <>
                                <span className="font-semibold">Welcome, {user?.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 transition text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 rounded-md bg-white text-indigo-600 font-semibold hover:bg-slate-100 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<HomePage search={search} user={user} books={books} setBooks={setBooks} />} />
                <Route path="/homepage" element={<HomePage user={user} books={books} setBooks={setBooks} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login setUser={setUser} token={token} setToken={setToken} />} />
                <Route path="/books/:id" element={<SingleBooks />} />
            </Routes>
        </Router>
    );
}

export default App;
