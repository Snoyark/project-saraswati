import { TOPIC_BY_URL_NAME, DEFAULT_CUSTOMER_ID, MAX_CONCURRENT_RETRIEVERS_PER_CUSTOMER, SUPPORTED_TOPICS, MAX_CONCURRENT_CUSTOMERS } from '../utils/constants';
import { create_static_retrieval_chain, create_dynamic_retrieval_chain, WebsocketMessage, get_retriever_key } from '../utils/utils';
import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import * as _ from 'lodash'
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { set_base_vars } from '../utils/config';
import { construct_agent } from '../utils/agents';

set_base_vars()

// Create express app and add websocket capability
const expressServer = express();           // Type = Express 
const wsServer = expressWs(expressServer); // Type = expressWs.Instance
const app = wsServer.app;               // type = wsExpress.Application

type RetrievalChains = { [key: string]: any }

// Extend the WebSocket type to include our custom property
interface CustomWebSocket extends WebSocket {
  customerId?: string;
}

const port = 3001
let agent: any = null

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
app.ws('/chat', (ws: CustomWebSocket, req: Request) => {
    ws.customerId = (req.query.customerId as string) ?? DEFAULT_CUSTOMER_ID
    console.log('connected to ws')
    // Handle incoming messages, need to keep track of message history
    ws.on('message', async (websocket_message_str: string) => {
      let websocket_message: WebsocketMessage;
      try {
        websocket_message = JSON.parse(websocket_message_str)
      } catch (error) {
        console.error('Error parsing message:', error);
        ws.send('Sorry, I had an issue understanding that last message.');
        return
      }

      if (agent === null) {
        agent = construct_agent()
      }

      try {
        const { current_question, chat_history: fe_chat_history } = websocket_message
        // need to construct the message here
        const chat_history = _.map(fe_chat_history, item => {
          if (item.role === 'user') {
            return new HumanMessage(item.content)
          }
          return new AIMessage(item.content)
        })

        chat_history.push(new HumanMessage(current_question))

        let full_answer = ""
        const stream = await agent.stream({ messages: chat_history })

        for await (const chunk of stream) {
          if (chunk.agent && chunk.agent.messages && chunk.agent.messages[0] && chunk.agent.messages[0].content && chunk.agent.messages[0].content.length > 0) {
            full_answer = chunk.agent.messages[0].content
            for (const char of chunk.agent.messages[0].content) {
              process.stdout.write(char);
              ws.send(char)
              // Optional: add a small delay to simulate typing
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
        }
        ws.send('END_SEQUENCE')
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
    // await prepare_retrieval_chains()
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}`);
});