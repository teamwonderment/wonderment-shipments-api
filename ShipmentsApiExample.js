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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.ShipmentsTrackingServer = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var axios_1 = require("axios");
var express_rate_limit_1 = require("express-rate-limit");
var node_cache_1 = require("node-cache");
var express_validator_1 = require("express-validator");
// Server-side implementation
var ShipmentsTrackingServer = /** @class */ (function () {
    function ShipmentsTrackingServer(apiKey, apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.app = (0, express_1.default)();
        this.cache = new node_cache_1.default({ stdTTL: 300 }); // 5 minute cache
        this.setupMiddleware();
        this.setupRoutes();
    }
    ShipmentsTrackingServer.prototype.setupMiddleware = function () {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // Rate limiting
        var limiter = (0, express_rate_limit_1.rateLimit)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use('/api/tracking', limiter);
    };
    ShipmentsTrackingServer.prototype.setupRoutes = function () {
        this.app.post('/api/tracking', (0, express_validator_1.body)('searchTerm').trim().notEmpty(), this.handleTrackingRequest.bind(this));
    };
    ShipmentsTrackingServer.prototype.handleTrackingRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, searchTerm, cacheKey, cachedData, response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            res.status(400).json({ errors: errors.array() });
                            return [2 /*return*/];
                        }
                        searchTerm = req.body.searchTerm;
                        cacheKey = "tracking:".concat(searchTerm);
                        cachedData = this.cache.get(cacheKey);
                        if (cachedData) {
                            res.json(cachedData);
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.apiUrl, "/shipments/search"), {
                                query: searchTerm
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Wonderment-Access-Token': this.apiKey
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        this.cache.set(cacheKey, response.data);
                        res.json(response.data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Tracking API Error:', error_1);
                        res.status(((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({
                            error: 'Failed to fetch tracking information'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ShipmentsTrackingServer.prototype.start = function (port) {
        if (port === void 0) { port = 3000; }
        this.app.listen(port, function () {
            console.log("Tracking server running on port ".concat(port));
        });
    };
    return ShipmentsTrackingServer;
}());
exports.ShipmentsTrackingServer = ShipmentsTrackingServer;
// Usage examples:
var server = new ShipmentsTrackingServer('', // Add your API key here
'https://api.wonderment.com');
server.start(3000);
