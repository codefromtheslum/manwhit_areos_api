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
exports.searchFlights = void 0;
const axios_1 = __importDefault(require("axios"));
const getToken_1 = __importDefault(require("../utils/getToken"));
const baseURL = "https://test.api.amadeus.com";
// Search for available flights
const searchFlights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { originName, destinationName, departureDate, returnDate, adults, travelClass, nonStop, } = req.query;
        if (!originName || !destinationName || !departureDate || !adults) {
            return res
                .status(400)
                .json({ message: "Missing required query parameters" });
        }
        const token = yield (0, getToken_1.default)();
        // Fetch IATA codes for origin and destination
        const getCode = (city) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const locationRes = yield axios_1.default.get(`${baseURL}/v1/reference-data/locations`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    subType: "CITY,AIRPORT",
                    keyword: city,
                },
            });
            const data = (_b = (_a = locationRes.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0];
            return (data === null || data === void 0 ? void 0 : data.iataCode) || city;
        });
        const originLocationCode = yield getCode(originName);
        const destinationLocationCode = yield getCode(destinationName);
        const flightRes = yield axios_1.default.get(`${baseURL}/v2/shopping/flight-offers`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                originLocationCode,
                destinationLocationCode,
                departureDate,
                returnDate,
                adults,
                travelClass,
                nonStop,
            },
        });
        return res.json(flightRes.data);
    }
    catch (error) {
        console.error("Amadeus API Error:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || (error === null || error === void 0 ? void 0 : error.message));
        return res
            .status(500)
            .json({ message: "Error searching flights", error: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.searchFlights = searchFlights;
