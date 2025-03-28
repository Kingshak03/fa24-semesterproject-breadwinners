import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import DOMPurify from 'dompurify';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import './BookPage.css';

export default function BookPage() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [message, setMessage] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [review, setReview] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookById = async () => {
            try {
                const response = await fetch(`./backend/FetchBookById.php?id=${id}`);
                const data = await response.json();
                if (data.success) {
                    setBook(data.book);
                } else {
                    setError(data.message);
                }
            } catch (error) {
                setError('An error occurred while fetching book details.');
            }
        };

        const checkWishlist = async () => {
            try {
                const response = await fetch(`./backend/CheckWishlist.php?id=${id}`);
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            } catch (error) {
                console.error('Error checking wishlist:', error);
            }
        };

        fetchBookById();
        checkWishlist();
    }, [id]);

    const handleBookmarkToggle = async () => {
        try {
            const response = await fetch('./backend/AddToWishlist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                setIsBookmarked((prev) => !prev);
            } else {
                console.error("Failed to toggle wishlist:", data.message);
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        }
    };

    const handleShare = () => {
        const baseLink = `${window.location.origin}${window.location.pathname}`;
        const link = `${baseLink}#/guest_book/${id}`;
        setShareLink(link);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setMessage(DOMPurify.sanitize('Link copied to clipboard!'));
        });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendEmail = async () => {
        if (!validateEmail(email)) {
            setEmailError('Invalid email address. Please enter a valid one.');
            setMessage(''); // Clear the success message if email is invalid
            setEmail(''); // Clear the email field
            return;
        }

        setEmailError(''); // Clear any previous error message

        try {
            const response = await fetch('./backend/SendRecommendationEmail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, link: shareLink }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(DOMPurify.sanitize("Recommendation sent!"));
                setEmail(''); // Clear the email field after sending
            } else {
                setMessage(DOMPurify.sanitize(`Failed to send recommendation: ${data.message}`));
            }
        } catch (error) {
            console.error("Error sending email:", error);
            setMessage(DOMPurify.sanitize("An error occurred while sending the email."));
        }
    };

    const handleAddToCart = async (bookId, bookTitle) => {
        try {
            const response = await fetch('./backend/add_to_cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookId,
                    bookTitle,
                    quantity: 1, // Always send quantity as 1
                }),
            });

            const data = await response.json();
            if (data.success) {
                console.log('Book added to cart');
            } else {
                console.error('Failed to add book to cart:', data.message);
            }
        } catch (error) {
            console.error('Error adding book to cart:', error);
        }
    };

    const handleRatingSubmit = async () => {
        try {
            const response = await fetch('./backend/UpdateBookRating.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, rating: userRating }),
            });
            const data = await response.json();
            if (data.success) {
                setBook((prevBook) => ({
                    ...prevBook,
                    rating: data.newRating,
                    ratings_count: data.newRatingsCount,
                }));
                setUserRating(0); // Reset user's rating input
            } else {
                console.error("Failed to update rating:", data.message);
            }
        } catch (error) {
            console.error("Error updating rating:", error);
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`./backend/FetchReviews.php?id=${id}`);
                const data = await response.json();
                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    console.error("Failed to fetch reviews:", data.message);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
    
        fetchReviews();
    }, [id]);

    const handleReviewSubmit = async () => {
        if (!review.trim()) {
            setReviewMessage("Review cannot be empty.");
            return;
        }
    
        try {
            const response = await fetch('./backend/AddReview.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookId: id, review }),
            });
            const data = await response.json();
            if (data.success) {
                setReviewMessage("Review submitted successfully!");
                setReview(''); // Clear the input
                // Refresh reviews
                const updatedReviewsResponse = await fetch(`./backend/FetchReviews.php?id=${id}`);
                const updatedReviewsData = await updatedReviewsResponse.json();
                if (updatedReviewsData.success) {
                    setReviews(updatedReviewsData.reviews);
                }
            } else {
                setReviewMessage(`Failed to submit review: ${data.message}`);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            setReviewMessage("An error occurred while submitting the review.");
        }
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!book) {
        return <div>Loading...</div>;
    }

    const imageUrl = `./${book.image_url}`;
    const sanitizedTitle = DOMPurify.sanitize(book.title);
    const sanitizedAuthor = DOMPurify.sanitize(book.author);
    const sanitizedGenre = DOMPurify.sanitize(book.genre);
    const sanitizedDescription = DOMPurify.sanitize(book.description);

    return (
        <main className="book-page">
            <header className="header-bar">
                <h1 className="logo">BREADWINNERS</h1>
            </header>
            <div className="book-content">
                <div className="left-side">
                    <img src={imageUrl} alt={sanitizedTitle} className="book-cover" />
                    <div className="bookmark-section">
                        <IconButton
                            color="primary"
                            aria-label="bookmark this book"
                            className="bookmark-icon"
                            onClick={handleBookmarkToggle}
                        >
                            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                        <span>Add to Wishlist</span>
                    </div>
                </div>

                <div className="right-side">
                    <h1 className="book-title">{sanitizedTitle}</h1>
                    <div className="author">by {sanitizedAuthor}</div>
                    <div className="genre-description">
                        <div className="genre">
                            <span>Genre:</span> {sanitizedGenre}
                        </div>
                        <p className="description-label">Description:</p>
                        <p className="description">{sanitizedDescription}</p>
                    </div>
                    <div className="average-rating">
                        <Typography component="legend">Average Rating:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                name="read-only"
                                value={book.rating || 0}
                                readOnly
                                precision={0.5}
                                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                            />
                            <Typography variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
                                {book.rating || '0.0'} ({book.ratings_count || 0} ratings)
                            </Typography>
                        </Box>
                    </div>
                    <div className="price">${book.price}</div>
                    <div className="cart-section">
                        <div className="cart-info">
                            <p>Purchase this book for ${book.price}</p>
                            <span>Fast Delivery</span>
                        </div>
                        <Button
                            className="cart-button"
                            variant="contained"
                            onClick={() => handleAddToCart(book.id, book.title)}
                        >
                            Add to Cart
                        </Button>
                    </div>
                    <div className="rating-section">
                        <Typography variant="body1" color="textSecondary">
                            Rate This Book
                        </Typography>
                        <Rating
                            name="user-controlled"
                            value={userRating}
                            onChange={(event, newValue) => setUserRating(newValue)}
                            precision={1}
                        />
                        <Button
                            className="submit-rating-button"
                            variant="contained"
                            onClick={handleRatingSubmit}
                        >
                            Submit Rating
                        </Button>
                    </div>
                    <IconButton color="primary" aria-label="share this book" onClick={handleShare}>
                        <ShareIcon />
                    </IconButton>
                    {shareLink && (
                        <div className="share-options">
                            <p className="share-link">Share Link: {shareLink}</p>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCopyLink}
                                style={{ marginBottom: '10px' }}
                            >
                                Copy Link
                            </Button>
                            <TextField
                                label="Enter email to send recommendation"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                size="small"
                                style={{ marginBottom: '10px' }}
                                error={!!emailError}
                                helperText={emailError}
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSendEmail}
                            >
                                Send Email
                            </Button>
                        </div>
                    )}
                    {message && <p className="message">{message}</p>}
                    <div className="review-section">
                        <TextField
                            label="Write your review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            style={{ marginBottom: '10px' }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReviewSubmit}
                        >
                            Submit Review
                        </Button>
                        {reviewMessage && <p className="review-message">{reviewMessage}</p>}
                    </div>
                    {/* Add the reviews list here */}
                    <div className="reviews-list">
                        <Typography variant="h6" style={{ marginTop: '20px' }}>
                            Reviews
                        </Typography>
                        {reviews.length > 0 ? (
                            <List>
                                {reviews.map((rev, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={DOMPurify.sanitize(rev.user)}
                                                secondary={DOMPurify.sanitize(rev.review)}
                                            />
                                        </ListItem>
                                        {index < reviews.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No reviews yet. Be the first to review this book!
                            </Typography>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
