import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser, setToken }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_BASE_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiURL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {

                localStorage.setItem("token", data.token);
                setUser(data.user);
                setToken(data.token);
                navigate("/");
            } else {
                setError(data.error || "Login failed.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred during login.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-gray-950">
            <div className="w-full max-w-md bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl border border-amber-100 dark:border-zinc-600">
                <h1 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white">
                    Login
                </h1>
                {error && (
                    <div className="text-red-500 text-sm mb-4 text-center">
                        {error}
                    </div>
                )}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-zinc-700 dark:text-white"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-zinc-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg border-2 border-indigo-500 shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;