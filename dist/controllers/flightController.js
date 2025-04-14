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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFlightLocation = exports.searchFlights = void 0;
const axios_1 = __importDefault(require("axios"));
const getToken_1 = __importDefault(require("../utils/getToken"));
const baseURL = "https://test.api.amadeus.com";
// Search for available flights
const searchFlights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, travelClass, nonStop, } = req.query;
        if (!originLocationCode ||
            !destinationLocationCode ||
            !departureDate ||
            !returnDate ||
            !adults ||
            !nonStop) {
            return res
                .status(400)
                .json({ message: "Missing required query parameters" });
        }
        const token = yield (0, getToken_1.default)();
        const response = yield axios_1.default.get(`${baseURL}/v2/shopping/flight-offers`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                originLocationCode,
                destinationLocationCode,
                departureDate, // This format is YYYY-MM-DD
                returnDate, // This format is YYYY-MM-DD ??
                adults,
                travelClass, // ?? ECONOMY || PREMIUM || BUSINESS || FIRST || PREMIUM_ECONOMY,
                nonStop, // ?? TRUE|FALSE
            },
        });
        return res.json(response.data);
    }
    catch (error) {
        console.error("Amadeus API Error:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || (error === null || error === void 0 ? void 0 : error.message));
        return res
            .status(500)
            .json({ message: "Error searching flights", error: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.searchFlights = searchFlights;
// Look up flight pricing
const searchFlightLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subType, keyword } = req.query;
        if (!subType || !keyword) {
            return res.status(400).json({ message: "Missing required parameters" });
        }
        const token = yield (0, getToken_1.default)();
        const response = yield axios_1.default.get(`${baseURL}/v1/reference-data/locations`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                subType, // AIRPORT || CITY
                keyword, // County Code ?? NYC ?? SFO ?? ATL ?? DEN
            },
        });
        return res.json(response.data);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error searching flight price",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.searchFlightLocation = searchFlightLocation;
