import express, { Router, Request, Response } from 'express';
import { Book } from '../models/bookModel';

const router: Router = express.Router();

const bookRoutes = (io: any) => {
    // Sugerir libros según el género
    router.get('/suggest', async (req: Request, res: Response): Promise<Response | void> => {
        const { genre } = req.query;
        try {
            const books = await Book.find({ genre });
            return res.json(books);
        } catch (err) {
            return res.status(500).json({ error: 'An error occurred' });
        }
    });

    // Añadir una reseña a un libro
    router.post('/:id/review', async (req: Request, res: Response): Promise<Response | void> => {
        const { id } = req.params;
        const { userId, review, rating } = req.body;

        try {
            const book = await Book.findById(id);
            if (!book) return res.status(404).json({ message: 'Book not found' });

            book.reviews.push({ userId, review, rating });
            await book.save();

            io.emit('newReview', { bookId: id, review });

            return res.status(201).json({ message: 'Review added successfully' });
        } catch (err) {
            return res.status(400).json({ error: 'Failed to add review' });
        }
    });

    // Obtener reseñas de un libro
    router.get('/:id/reviews', async (req: Request, res: Response): Promise<Response | void> => {
        const { id } = req.params;

        try {
            const book = await Book.findById(id).populate('reviews.userId', 'username');
            if (!book) return res.status(404).json({ message: 'Book not found' });

            return res.json(book.reviews);
        } catch (err) {
            return res.status(400).json({ error: 'Failed to fetch reviews' });
        }
    });

    return router;
};

export default bookRoutes;

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books
 */

/**
 * @swagger
 * /books/suggest:
 *   get:
 *     tags: [Books]
 *     summary: Suggest books based on genre
 *     parameters:
 *       - name: genre
 *         in: query
 *         description: Genre to filter books
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of suggested books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: No books found
 */

/**
 * @swagger
 * /books/{id}/review:
 *   post:
 *     tags: [Books]
 *     summary: Add a review to a specific book
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Book ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               review:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Failed to add review
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /books/{id}/reviews:
 *   get:
 *     tags: [Books]
 *     summary: Get all reviews for a specific book
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Book ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   review:
 *                     type: string
 *                   rating:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Book not found
 */

