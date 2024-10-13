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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_results = exports.search = void 0;
var axios_1 = require("axios");
var xmlParser = require("xml-js");
var _ = require("lodash");
var base_url = 'http://export.arxiv.org/api/';
var search = function (query, max_results) {
    if (max_results === void 0) { max_results = 10; }
    // Search Query stuff: https://info.arxiv.org/help/api/user-manual.html#query_details
    return axios_1.default.get("".concat(base_url, "query?search_query=").concat(query, "&sortBy=submittedDate&sortOrder=descending&max_results=").concat(max_results));
};
exports.search = search;
var process_result = function (entry) {
    var authors = _.map(entry.author, function (author) {
        if ('name' in author) {
            return author.name._text;
        }
        return author._text;
    });
    return {
        title: entry.title._text,
        authors: authors,
        created_on: new Date(Date.parse(entry.published._text)),
        updated_on: new Date(Date.parse(entry.updated._text)),
        pdf_link: entry.id._text.replace('abs', 'pdf'),
        summary: entry.summary._text,
    };
};
var get_results = function (search_field_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([search_field_1], args_1, true), void 0, function (search_field, max_results) {
        var res, js_data, articles;
        if (max_results === void 0) { max_results = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.search)(search_field, max_results)];
                case 1:
                    res = _a.sent();
                    js_data = JSON.parse(xmlParser.xml2json(res.data, { compact: true, spaces: 2 }));
                    articles = _.map(js_data.feed.entry, function (entry) {
                        return process_result(entry);
                    });
                    return [2 /*return*/, articles];
            }
        });
    });
};
exports.get_results = get_results;
(0, exports.get_results)('neuroscience');
