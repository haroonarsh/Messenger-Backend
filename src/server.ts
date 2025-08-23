import http from 'http';
import app from './app';
import { connectDB } from './config/database';
import config from './config/config';
import { initSocket } from './utils/socket';

const port = config.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

async function startServer() {
    await connectDB();
    server.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
    });
}

startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});