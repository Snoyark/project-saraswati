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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNanoSecTime = exports.delay = exports.get_document_chain = exports.init_and_get_retriever = exports.get_documents_from_text = exports.get_chat_model = exports.embeddings = exports.splitter = void 0;
var cheerio_1 = require("@langchain/community/document_loaders/web/cheerio");
var text_splitter_1 = require("langchain/text_splitter");
var ollama_1 = require("@langchain/community/embeddings/ollama");
var _ = require("lodash");
var createStuffDocumentsChain = require("langchain/chains/combine_documents").createStuffDocumentsChain;
var ChatOllama = require("@langchain/community/chat_models/ollama").ChatOllama;
var ChromaClient = require("chromadb").ChromaClient;
var Chroma = require("@langchain/community/vectorstores/chroma").Chroma;
exports.splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
var loader = new cheerio_1.CheerioWebBaseLoader("https://docs.smith.langchain.com/user_guide");
var neuro_loader = new cheerio_1.CheerioWebBaseLoader("https://www.jneurosci.org/content/44/13/e1794232024");
exports.embeddings = new ollama_1.OllamaEmbeddings({
    model: 'llama2:latest',
    maxConcurrency: 5,
});
var get_chat_model = function (model) {
    return new ChatOllama({
        baseUrl: "http://localhost:11434", // Default value
        model: model !== null && model !== void 0 ? model : "llama2:latest",
    });
};
exports.get_chat_model = get_chat_model;
var get_documents_from_text = function (text) { return __awaiter(void 0, void 0, void 0, function () {
    var text_split, text_docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.splitter.splitText(text)];
            case 1:
                text_split = _a.sent();
                text_docs = _.map(text_split, function (text_piece) {
                    return { pageContent: text_piece, metadata: {} };
                });
                return [2 /*return*/, text_docs];
        }
    });
}); };
exports.get_documents_from_text = get_documents_from_text;
var init_and_get_retriever = function () { return __awaiter(void 0, void 0, void 0, function () {
    var docs, neuro_docs, splitDocs, splitNeuroDocs, chroma, collection, vectorstore;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('about to wait for loader.load');
                return [4 /*yield*/, loader.load()];
            case 1:
                docs = _a.sent();
                return [4 /*yield*/, neuro_loader.load()];
            case 2:
                neuro_docs = _a.sent();
                console.log('about to wait for the splitter to split the documents');
                return [4 /*yield*/, exports.splitter.splitDocuments(docs)];
            case 3:
                splitDocs = _a.sent();
                return [4 /*yield*/, exports.splitter.splitDocuments(neuro_docs)];
            case 4:
                splitNeuroDocs = _a.sent();
                chroma = new ChromaClient();
                return [4 /*yield*/, chroma.reset()];
            case 5:
                _a.sent();
                return [4 /*yield*/, chroma.createCollection({ name: "neuro" }).catch(function (err) {
                        console.log(err);
                        throw err;
                    })];
            case 6:
                collection = _a.sent();
                vectorstore = new Chroma(exports.embeddings, {
                    index: chroma,
                    collectionName: collection.name,
                });
                console.log('db initialized');
                return [4 /*yield*/, vectorstore.addDocuments(splitDocs)];
            case 7:
                _a.sent();
                return [4 /*yield*/, vectorstore.addDocuments(splitNeuroDocs)];
            case 8:
                _a.sent();
                console.log('documents added');
                return [2 /*return*/, vectorstore.asRetriever()];
        }
    });
}); };
exports.init_and_get_retriever = init_and_get_retriever;
var get_document_chain = function (prompt) { return __awaiter(void 0, void 0, void 0, function () {
    var chatModel, documentChain;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chatModel = (0, exports.get_chat_model)();
                return [4 /*yield*/, createStuffDocumentsChain({
                        llm: chatModel,
                        prompt: prompt,
                    })];
            case 1:
                documentChain = _a.sent();
                console.log('create document chain');
                return [2 /*return*/, documentChain];
        }
    });
}); };
exports.get_document_chain = get_document_chain;
var delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
    });
}); };
exports.delay = delay;
function getNanoSecTime() {
    var hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}
exports.getNanoSecTime = getNanoSecTime;
