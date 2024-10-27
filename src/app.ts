import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bookRoutes from './routes/bookRoutes';
import socketHandler from './sockets/socket';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Book Recommendation API',
            version: '1.0.0',
            description: 'API for recommending and reviewing books',
        },
        components: {
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        author: { type: 'string' },
                        genre: { type: 'string' },
                        summary: { type: 'string' },
                        reviews: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'string' },
                                    review: { type: 'string' },
                                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                                    createdAt: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                        authorBio: { type: 'string' },
                    },
                },
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Database Connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/books', bookRoutes(io));
app.use('/api/auth', authRoutes);

// WebSocket Integration
socketHandler(io);

// Removed duplicate swaggerOptions declaration

// Start the Server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});