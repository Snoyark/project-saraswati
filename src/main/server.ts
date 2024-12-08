import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';

// Create express app and add websocket capability
const expressServer = express();           // Type = Express 
const wsServer = expressWs(expressServer); // Type = expressWs.Instance
const app = wsServer.app;               // type = wsExpress.Application

const port = 3001

// Middleware to parse JSON bodies
app.use(express.json());

// Regular HTTP endpoints
app.get('/ping', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
});

app.post('/echo', (req: Request, res: Response) => {
    res.status(200).json(req.body);
});

// WebSocket endpoint
app.ws('/ws', (ws: WebSocket, req: Request) => {
    console.log('Client connected to WebSocket');

    // Handle incoming messages
    ws.on('message', (msg: string) => {
        try {
            // Echo the message back to the client
            ws.send(`Server received: ${msg}`);
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send('Error processing message');
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });

    // Handle errors
    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}/ws`);
});