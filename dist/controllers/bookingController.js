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
exports.bookFlight = exports.verifyFlightPrice = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const getToken_1 = __importDefault(require("../utils/getToken"));
const prisma = new client_1.PrismaClient();
const baseURL = "https://test.api.amadeus.com";
const verifyFlightPrice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        return res.status(500).json({
            message: "Error verifying flight price",
            data: error === null || error === void 0 ? void 0 : error.message
        });
    }
});
exports.verifyFlightPrice = verifyFlightPrice;
const bookFlight = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId, flightOffer, travelers } = req.body;
    if (!userId || !flightOffer || !(travelers === null || travelers === void 0 ? void 0 : travelers.length)) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }
    try {
        const token = yield (0, getToken_1.default)();
        const bookingResponse = yield axios_1.default.post(`${baseURL}/v1/booking/flight-orders`, {
            data: {
                flightOffers: [flightOffer],
                travelers
            },
        }, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.amadeus+json" }
        });
        const apiResponse = bookingResponse.data;
        const apiReferenceId = (_a = bookingResponse === null || bookingResponse === void 0 ? void 0 : bookingResponse.data) === null || _a === void 0 ? void 0 : _a.id;
        // Storing booking in database
        const booking = yield prisma.booking.create({
            data: {
                userId,
                referenceId: `BOOK-${Date.now()}`,
                type: "FLIGHT",
                status: "PENDING",
                apiResponse,
                bookingDetails: {
                    origin: flightOffer.itineraries[0].segments[0].departure.iataCode,
                    destination: flightOffer.itineraries[0].segments[0].arrival.iataCode,
                    departureDate: flightOffer.itineraries[0].segments[0].departure.at,
                },
                apiProvider: "AMADEUS",
                apiReferenceId
            }
        });
        for (const traveler of travelers) {
            yield prisma.traveler.create({
                data: {
                    bookingId: booking.id,
                    firstName: traveler.firstName,
                    lastName: traveler.lastName,
                    dateOfBirth: new Date(traveler.dateOfBirth),
                    gender: traveler.gender,
                    email: traveler.email,
                    phone: traveler.phone,
                    countryCode: traveler.countryCode,
                    birthPlace: traveler.birthPlace || null,
                    passportNumber: traveler.passportNumber || null,
                    passportExpiry: traveler.passportExpiry ? new Date(traveler.passportExpiry) : null,
                    issuanceCountry: traveler.issuanceCountry || null,
                    validityCountry: traveler.validityCountry || null,
                    nationality: traveler.nationality || null,
                    issuanceDate: traveler.issuanceDate ? new Date(traveler.issuanceDate) : null,
                    issuanceLocation: traveler.issuanceLocation || null,
                },
            });
        }
        return res.status(200).json({
            message: "Flight booked successfully",
            data: booking
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error booking flight",
            data: error === null || error === void 0 ? void 0 : error.message
        });
    }
});
exports.bookFlight = bookFlight;
