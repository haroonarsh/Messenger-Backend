import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware';
import pino from 'pino';
import config from './config';
import pinoHttp from 'pino-http';
import router from './routes';
import cookieParser from 'cookie-parser';

const logger = pino({ level: config.LOG_LEVEL });
const app = express();

// request logger
app.use(pinoHttp({ logger }));

// build-in middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(cookieParser());

// routes
app.use('/api', router);

//404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// custom middlewares
app.use(errorMiddleware);

export default app;