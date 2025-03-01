import { TOPIC_BY_URL_NAME, DEFAULT_CUSTOMER_ID, MAX_CONCURRENT_RETRIEVERS_PER_CUSTOMER, SUPPORTED_TOPICS, MAX_CONCURRENT_CUSTOMERS } from '../utils/constants';
import { create_static_retrieval_chain, create_dynamic_retrieval_chain, WebsocketMessage, get_retriever_key } from '../utils/utils';
import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import * as _ from 'lodash'
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { set_base_vars } from '../utils/config';

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
const retrieval_chains: RetrievalChains = {}

// Need to run this at startup
const prepare_retrieval_chains = async () => {
  _.map(SUPPORTED_TOPICS, async topic => {
    retrieval_chains[topic.url_name] = await create_static_retrieval_chain(topic)
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
app.ws('/:topic/:customer_id', (ws: CustomWebSocket, req: Request) => {
    console.log(`Client connected to WebSocket ${req.params.topic}`);
    ws.customerId = req.params.customer_id ?? DEFAULT_CUSTOMER_ID

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

      const customer_id = ws.customerId ?? DEFAULT_CUSTOMER_ID
      const retrieval_chain_key = get_retriever_key(websocket_message, req.params.topic)
      let retrieval_chain;
      if (!retrieval_chains[customer_id] || !retrieval_chains[customer_id][retrieval_chain_key]) {
        if (retrieval_chains.length >= MAX_CONCURRENT_CUSTOMERS || retrieval_chains[customer_id].length >= MAX_CONCURRENT_RETRIEVERS_PER_CUSTOMER) {
          console.error('retrieval_chains.length >= MAX_NUM_RETRIEVERS, deny request to current user')
          ws.send('Sorry, it seems I\'m busy right now. Please try again later.');
          return
        }
        // the current_paper/date_range should be fed in here
        retrieval_chain = create_dynamic_retrieval_chain({
          topic: TOPIC_BY_URL_NAME[req.params.topic],
          chain_scope: 'general',
          title: websocket_message.current_paper,
          from_time: websocket_message.from_time ?? 0,
          to_time: websocket_message.to_time ?? new Date().getTime(),
        })
        retrieval_chains[customer_id] = retrieval_chains[customer_id] ?? {}
        retrieval_chains[customer_id][retrieval_chain_key] = retrieval_chain
      } else {
        retrieval_chain = retrieval_chains[customer_id][retrieval_chain_key]
      }
      console.log(websocket_message_str)
      try {
        const { current_question, chat_history: fe_chat_history } = websocket_message
        // need to construct the message here
        const chat_history = _.map(fe_chat_history, item => {
          if (item.role === 'user') {
            return new HumanMessage(item.content)
          }
          return new AIMessage(item.content)
        })

        console.log(`fe_chat_history: ${JSON.stringify(fe_chat_history)}`)

        let full_answer = ""
        // const retrieval_chain = retrieval_chains[req.params.topic]

        const stream = await retrieval_chain.stream({ 
          messages: chat_history,
          chat_history: (fe_chat_history ?? []).map(msg => `${msg.role}: ${msg.content}`).join('\n'), 
          input: current_question,
        })
        for await (const stream_chunk of stream) {
          if (!_.isNil(stream_chunk.answer)) {
            ws.send(stream_chunk.answer)
            full_answer += stream_chunk.answer
          }
        }
        ws.send('END_SEQUENCE')
        console.log(full_answer)
      } catch (error) {
          console.error('Error processing message:', error);
          ws.send('Sorry, I had an issue understanding that last message.');
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      delete retrieval_chains[ws.customerId ?? DEFAULT_CUSTOMER_ID]
      console.log('Client disconnected from WebSocket');
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      delete retrieval_chains[ws.customerId ?? DEFAULT_CUSTOMER_ID]
      console.error('WebSocket error:', error);
    });
});

app.listen(port, async () => {
    // await prepare_retrieval_chains()
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}`);
});