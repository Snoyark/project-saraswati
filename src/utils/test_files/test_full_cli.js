"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = require("node:readline/promises");
var node_process_1 = require("node:process");
var utils_1 = require("./utils");
var ChatOllama = require("@langchain/community/chat_models/ollama").ChatOllama;
var ChromaClient = require("chromadb").ChromaClient;
var CheerioWebBaseLoader = require("langchain/document_loaders/web/cheerio").CheerioWebBaseLoader;
var RecursiveCharacterTextSplitter = require("langchain/text_splitter").RecursiveCharacterTextSplitter;
var OllamaEmbeddings = require("@langchain/community/embeddings/ollama").OllamaEmbeddings;
var Chroma = require("@langchain/community/vectorstores/chroma").Chroma;
var MemoryVectorStore = require("langchain/vectorstores/memory").MemoryVectorStore;
var createStuffDocumentsChain = require("langchain/chains/combine_documents").createStuffDocumentsChain;
var ChatPromptTemplate = require("@langchain/core/prompts").ChatPromptTemplate;
// const { createRetrievalChain } = require("langchain/chains/retrieval");
var retrieval_1 = require("langchain/chains/retrieval");
var pdf_util = require('pdf-ts');
var fs = require('node:fs/promises');
var Document = require("@langchain/core/documents").Document;
var createHistoryAwareRetriever = require("langchain/chains/history_aware_retriever").createHistoryAwareRetriever;
var MessagesPlaceholder = require("@langchain/core/prompts").MessagesPlaceholder;
var chatModel = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama2:latest",
});
var main = function () {
    return __awaiter(this, void 0, void 0, function () {
        var readline, retriever, prompt, document_chain, retrievalChain, messages, userInput, stream, full_answer, _a, stream_1, stream_1_1, stream_chunk, e_1_1, botMessage, error_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    readline = (0, promises_1.createInterface)({ input: node_process_1.stdin, output: node_process_1.stdout });
                    return [4 /*yield*/, (0, utils_1.init_and_get_retriever)()];
                case 1:
                    retriever = _e.sent();
                    prompt = ChatPromptTemplate.fromTemplate("You are a AI helping people learn things about neuroscience and artificial intelligence. You should provide the source of the information if it comes from the context provided. Answer the following question using the following context if the information is there, and only if it isn't give a general response:\n  <context>\n  {context}\n  </context>\n  Question: {input}");
                    return [4 /*yield*/, (0, utils_1.get_document_chain)(prompt)];
                case 2:
                    document_chain = _e.sent();
                    return [4 /*yield*/, (0, retrieval_1.createRetrievalChain)({
                            retriever: retriever,
                            combineDocsChain: document_chain,
                        })];
                case 3:
                    retrievalChain = _e.sent();
                    messages = [];
                    return [4 /*yield*/, readline.question("Ask me your questions!\n\n")];
                case 4:
                    userInput = _e.sent();
                    _e.label = 5;
                case 5:
                    if (!(userInput !== ".exit")) return [3 /*break*/, 27];
                    messages.push({ role: "user", content: userInput });
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 24, , 26]);
                    return [4 /*yield*/, retrievalChain.stream({ input: userInput })];
                case 7:
                    stream = _e.sent();
                    full_answer = "";
                    _e.label = 8;
                case 8:
                    _e.trys.push([8, 13, 14, 19]);
                    _a = true, stream_1 = (e_1 = void 0, __asyncValues(stream));
                    _e.label = 9;
                case 9: return [4 /*yield*/, stream_1.next()];
                case 10:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 12];
                    _d = stream_1_1.value;
                    _a = false;
                    stream_chunk = _d;
                    if (typeof stream_chunk.answer === 'string') {
                        full_answer += stream_chunk.answer;
                        // would add this to a buffer or react state and show this on the web terminal
                    }
                    _e.label = 11;
                case 11:
                    _a = true;
                    return [3 /*break*/, 9];
                case 12: return [3 /*break*/, 19];
                case 13:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 19];
                case 14:
                    _e.trys.push([14, , 17, 18]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 16];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 15:
                    _e.sent();
                    _e.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 18: return [7 /*endfinally*/];
                case 19:
                    console.log(full_answer);
                    if (!(full_answer === "")) return [3 /*break*/, 21];
                    return [4 /*yield*/, readline.question("\nNo response, try asking again\n")];
                case 20:
                    userInput = _e.sent();
                    return [3 /*break*/, 23];
                case 21: return [4 /*yield*/, readline.question("\n")];
                case 22:
                    userInput = _e.sent();
                    _e.label = 23;
                case 23:
                    botMessage = { role: 'bot', content: full_answer };
                    if (botMessage) {
                        messages.push(botMessage);
                    }
                    return [3 /*break*/, 26];
                case 24:
                    error_1 = _e.sent();
                    console.log(error_1);
                    return [4 /*yield*/, readline.question("\nSomething went wrong, try asking again\n")];
                case 25:
                    userInput = _e.sent();
                    return [3 /*break*/, 26];
                case 26: return [3 /*break*/, 5];
                case 27:
                    readline.close();
                    return [2 /*return*/];
            }
        });
    });
};
main();
