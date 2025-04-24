import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = ({ books = {}, setBooks, search }) => {
    const filter = books.filter((book) => book.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-gray-950 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-white mb-10">
                    Welcome to BookHaven 📚
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filter.map((book) => (
                        <div
                            key={book.id}
                            className="relative group bg-amber-100 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl shadow hover:shadow-2xl hover:scale-105 hover:ring-4 hover:ring-indigo-300 dark:hover:ring-indigo-500 transition-transform duration-300 p-6"
                        >
                            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
                                {book.title}
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                by {book.author}
                            </p>
                            <Link
                                to={`/books/${book.id}`}
                                className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition"
                            >
                                View Details
                            </Link>

                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-indigo-800 dark:text-indigo-300">
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;