import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BookPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedReviewText, setEditedReviewText] = useState("");
    const [editedCommentText, setEditedCommentText] = useState("");

    const fetchBookDetails = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/books/${id}`);
            const data = await res.json();
            setBook(data.book);
            setReviews(data.reviews);
            console.log(reviews);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };
    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/me`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            console.log(data)
            setUserInfo(data);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchBookDetails();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    book_id: id,
                    rating: newRating,
                    review_text: newReview,
                    user_id: userInfo?.id,
                }),
            });

            if (res.ok) {
                await fetchBookDetails();
                setNewReview("");
                setNewRating(5);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    const handleCommentSubmit = async (e, reviewId) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    review_id: reviewId,
                    user_id: userInfo?.id,
                    comment_text: newComment,
                }),
            });

            if (res.ok) {
                await fetchBookDetails();
                setNewComment("");
                setSelectedReviewId(null);
            } else {
                const errorData = await res.json();
                console.error("Error response from server:", errorData);
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            await fetchBookDetails();
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const handleEditReview = async (reviewId) => {
        try {
            await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ review_text: editedReviewText })
            });
            setEditingReviewId(null);
            await fetchBookDetails();
        } catch (error) {
            console.error("Error editing review:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const token = localStorage.getItem("token")
        console.log(token)
        try {
            await fetch(`http://localhost:3000/api/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            await fetchBookDetails();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleEditComment = async (commentId) => {
        try {
            await fetch(`http://localhost:3000/api/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ comment_text: editedCommentText })
            });
            setEditingCommentId(null);
            await fetchBookDetails();
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-6">
            {book ? (
                <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{book.title}</h1>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">by {book.author}</p>
                    <p className="text-slate-700 dark:text-gray-200 mb-8">{book.description}</p>

                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Reviews</h2>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-amber-50 dark:bg-zinc-700 border border-amber-200 dark:border-zinc-600 rounded-xl p-5 mb-6"
                            >
                                <p className="text-yellow-500 font-semibold mb-1">
                                    ⭐ {review.rating} / 5 by <span className="text-indigo-600">{review.username}</span>
                                </p>
                                {editingReviewId === review.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            className="w-full mt-2 p-2 rounded border dark:border-zinc-600 bg-white dark:bg-zinc-800 dark:text-white"
                                            value={editedReviewText}
                                            onChange={(e) => setEditedReviewText(e.target.value)}
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => handleEditReview(review.id)}
                                                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingReviewId(null)}
                                                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                                            >
                                                Cancel
                                            </button>

                                        </div>
                                    </div>

                                ) : (
                                    <>
                                        <p className="text-slate-800 dark:text-white">{review.review_text}</p>
                                        {console.log("user info", userInfo)}
                                        {console.log("review", review)}
                                        {userInfo?.username === review.username && (

                                            <div className="mt-2 flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingReviewId(review.id);
                                                        setEditedReviewText(review.review_text);
                                                    }}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-1 text-slate-700 dark:text-gray-200">Comments:</h3>
                                    {review.comments?.length > 0 ? (
                                        review.comments.map((comment) => (
                                            <div key={comment.id} className="ml-4 text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold">{comment.username}:</span>
                                                {editingCommentId === comment.id ? (
                                                    <>
                                                        <textarea
                                                            className="w-full mt-1 p-1 rounded border dark:border-zinc-600 bg-white dark:bg-zinc-800 dark:text-white"
                                                            value={editedCommentText}
                                                            onChange={(e) => setEditedCommentText(e.target.value)}
                                                        />
                                                        <button onClick={() => handleEditComment(comment.id)} className="mt-1 mr-2 px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                                                        <button onClick={() => setEditingCommentId(null)} className="mt-1 px-2 py-1 bg-gray-400 text-white rounded">Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span> {comment.comment_text}</span>
                                                        {userInfo?.username === comment.username && (
                                                            <div className="text-sm flex gap-2 mt-1">
                                                                <button onClick={() => {
                                                                    setEditingCommentId(comment.id);
                                                                    setEditedCommentText(comment.comment_text);
                                                                }} className="text-blue-600 hover:underline">Edit</button>
                                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-red-600 hover:underline">Delete</button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="ml-4 text-gray-500 italic">No comments yet.</p>
                                    )}
                                </div>

                                <form onSubmit={(e) => handleCommentSubmit(e, review.id)} className="mt-3">
                                    <input
                                        type="text"
                                        value={selectedReviewId === review.id ? newComment : ""}
                                        onChange={(e) => {
                                            setSelectedReviewId(review.id);
                                            setNewComment(e.target.value);
                                        }}
                                        placeholder="Add a comment"
                                        className="w-full p-2 rounded border dark:border-zinc-600 bg-white dark:bg-zinc-800 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded border-2 border-indigo-500 shadow-md hover:bg-indigo-700 hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        Add Comment
                                    </button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">No reviews yet.</p>
                    )}

                    <form onSubmit={handleReviewSubmit} className="mt-10">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Leave a Review</h2>
                        <div className="mb-4">
                            <label className="block mb-1 text-slate-700 dark:text-gray-200">Rating:</label>
                            <select
                                value={newRating}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                className="w-full p-2 rounded border dark:border-zinc-600 bg-white dark:bg-zinc-800 dark:text-white"
                            >
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-slate-700 dark:text-gray-200">Review:</label>
                            <textarea
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                                placeholder="Write your review..."
                                rows="4"
                                className="w-full p-2 rounded border dark:border-zinc-600 bg-white dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded border-2 border-indigo-500 shadow-md hover:bg-green-700 hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">Loading book details...</p>
            )}
        </div>
    );
};
export default BookPage;