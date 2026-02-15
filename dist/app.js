"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// import morgan from 'morgan';
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("./config"));
const pino_http_1 = __importDefault(require("pino-http"));
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger = (0, pino_1.default)({ level: config_1.default.LOG_LEVEL });
const app = (0, express_1.default)();
// request logger
app.use((0, pino_http_1.default)({ logger }));
// build-in middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.default.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.get('/', (req, res) => {
    res.json({
        message: 'Messenger Backend API Running 🚀',
        version: '1.0.0',
        time: new Date().toISOString()
    });
});
// if (config.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }
app.use((0, cookie_parser_1.default)());
// routes
app.use('/api', routes_1.default);
//404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
// custom middlewares
app.use(error_middleware_1.default);
exports.default = app;
