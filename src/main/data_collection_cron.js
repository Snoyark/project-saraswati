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
var dl_utils = require("../utils/download_utils");
var gen_utils = require("../utils/utils");
var arxiv_client = require("../clients/arxiv");
var chromadb_1 = require("chromadb");
var _ = require("lodash");
var bluebird_1 = require("bluebird");
var chroma_1 = require("@langchain/community/vectorstores/chroma");
// const argv = require('minimist')(process.argv.slice(2)) (from other repos)
// Idea of this file is to contain all the logic to get data from Arxiv (and any other source)
// and put that data into Chroma
// This should be at some regular cadence that both balances the rate limit requirement and the desire
// to have relatively recent data
// need a library for cron jobs (for later)
/*
Initialize Chroma Connection

Get metadata from Arxiv
Download main file data
Parse from PDF into text
Feed into Chroma
*/
var init = function (topic, chroma) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, vectorstore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Initialize ChromaClient
                return [4 /*yield*/, chroma.reset()];
                case 1:
                    // Initialize ChromaClient
                    _a.sent(); // Only for testing - do not have this uncommented
                    return [4 /*yield*/, chroma.getOrCreateCollection({ name: topic }).catch(function (err) {
                            console.log(err);
                            throw err;
                        })];
                case 2:
                    collection = _a.sent();
                    vectorstore = new chroma_1.Chroma(gen_utils.embeddings, {
                        index: chroma,
                        collectionName: collection.name,
                    });
                    return [2 /*return*/, vectorstore];
            }
        });
    });
};
var log_number_of_entries = function (topic, chroma) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, num_entries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, chroma.getOrCreateCollection({ name: topic })];
                case 1:
                    collection = _a.sent();
                    return [4 /*yield*/, collection.count()];
                case 2:
                    num_entries = _a.sent();
                    console.log("number of entries in ".concat(topic, ": ").concat(num_entries));
                    return [2 /*return*/];
            }
        });
    });
};
var run = function (topic, vectorstore) {
    return __awaiter(this, void 0, void 0, function () {
        var search_results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, arxiv_client.get_results(topic, 100)];
                case 1:
                    search_results = _a.sent();
                    console.log("got ".concat(search_results.length, " results"));
                    return [4 /*yield*/, bluebird_1.Promise.map(search_results, function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var file_path, failed, text, text_docs, summary_docs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        file_path = "./tmp_pdf_download/".concat(gen_utils.getNanoSecTime(), ".pdf");
                                        console.log('downloading');
                                        return [4 /*yield*/, dl_utils.downloadPdf(result.pdf_link, file_path)
                                                .then(function () { return false; })
                                                .catch(function () { return true; })]; // error encountered, just return from this iteration and skip this file)
                                    case 1:
                                        failed = _a.sent() // error encountered, just return from this iteration and skip this file)
                                        ;
                                        if (failed) {
                                            return [2 /*return*/];
                                        }
                                        console.log("downloaded ".concat(result.title));
                                        return [4 /*yield*/, dl_utils.ingest_pdf_to_text(file_path)];
                                    case 2:
                                        text = _a.sent();
                                        return [4 /*yield*/, gen_utils.get_documents_from_text(text)];
                                    case 3:
                                        text_docs = _a.sent();
                                        return [4 /*yield*/, gen_utils.get_documents_from_text(result.summary)
                                            // const docs = text_docs.concat(summary_docs)
                                        ];
                                    case 4:
                                        summary_docs = _a.sent();
                                        // const docs = text_docs.concat(summary_docs)
                                        console.log("ingesting ".concat(result.title));
                                        // put the data into Chroma
                                        return [4 /*yield*/, vectorstore.addDocuments(summary_docs, { ids: _.map(_.range(0, summary_docs.length), function (num) { return "".concat(result.title, ".summary.").concat(num); }) })];
                                    case 5:
                                        // put the data into Chroma
                                        _a.sent();
                                        console.log('added summaries');
                                        return [4 /*yield*/, vectorstore.addDocuments(text_docs, { ids: _.map(_.range(0, text_docs.length), function (num) { return "".concat(result.title, ".full_text.").concat(num); }) })];
                                    case 6:
                                        _a.sent();
                                        console.log("ingested ".concat(result.title));
                                        console.log("deleting ".concat(result.title));
                                        // remove the download
                                        return [4 /*yield*/, dl_utils.removeFile(file_path)];
                                    case 7:
                                        // remove the download
                                        _a.sent();
                                        console.log("deleted ".concat(result.title));
                                        return [4 /*yield*/, gen_utils.delay(2000)];
                                    case 8:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { concurrency: 1 })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var main = function (topic) {
    return __awaiter(this, void 0, void 0, function () {
        var chroma, chroma_client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chroma = new chromadb_1.ChromaClient();
                    return [4 /*yield*/, init(topic, chroma)];
                case 1:
                    chroma_client = _a.sent();
                    console.log('initialized collection');
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 5];
                    console.log('started run');
                    return [4 /*yield*/, run(topic, chroma_client)];
                case 3:
                    _a.sent();
                    console.log('finished run.');
                    return [4 /*yield*/, log_number_of_entries(topic, chroma)
                        // just wait until the next time
                    ];
                case 4:
                    _a.sent();
                    // just wait until the next time
                    process.exit(0);
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
};
main('neuro');
