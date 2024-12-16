import { SUPPORTED_TOPICS } from '../utils/constants';
import { create_retrieval_chain, remove_upper_and_space } from '../utils/utils';
import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import * as _ from 'lodash'

// Create express app and add websocket capability
const expressServer = express();           // Type = Express 
const wsServer = expressWs(expressServer); // Type = expressWs.Instance
const app = wsServer.app;               // type = wsExpress.Application

type RetrievalChains = { [key: string]: any }

const port = 3001
const retrieval_chains: RetrievalChains = {}

// Need to run this at startup
const prepare_retrieval_chains = async () => {
  _.map(SUPPORTED_TOPICS, async topic => {
    retrieval_chains[topic.url_name] = await create_retrieval_chain(topic)
  })
  return retrieval_chains
}

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
app.ws('/:topic', (ws: WebSocket, req: Request) => {
    console.log(`Client connected to WebSocket ${req.params.topic}`);

    // Handle incoming messages, need to keep track of message history
    ws.on('message', async (msg: string) => {
        try {
          // need to construct the message here
          let full_answer = ""
          const retrieval_chain = retrieval_chains[req.params.topic]
          const stream = await retrieval_chain.stream({ input: msg })
          for await (const stream_chunk of stream) {
            ws.send(stream_chunk.answer)
            full_answer += stream_chunk.answer
          }
          console.log(full_answer)
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send('Sorry, I had an issue understanding that last message.');
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

app.listen(port, async () => {
    await prepare_retrieval_chains()
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}/ws`);
});