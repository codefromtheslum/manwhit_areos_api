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
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.verifyFlightPrice = verifyFlightPrice;
const bookFlight = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { flightOffer, travelers } = req.body;
        if (!flightOffer ||
            !travelers ||
            !Array.isArray(travelers) ||
            travelers.length === 0) {
            return res
                .status(400)
                .json({ message: "Missing flightOffer or travelers data" });
        }
        const token = yield (0, getToken_1.default)();
        // Construct the booking payload
        const payload = {
            data: {
                type: "flight-order",
                flightOffers: [flightOffer],
                travelers: travelers.map((t) => ({
                    id: t.id,
                    dateOfBirth: t.dateOfBirth,
                    name: {
                        firstName: t.name.firstName,
                        lastName: t.name.lastName,
                    },
                    gender: t.gender,
                    contact: {
                        emailAddress: t.contact.emailAddress,
                        phones: t.contact.phones,
                    },
                    documents: t.documents,
                })),
            },
        };
        // Make the booking request to Amadeus
        const bookingResponse = yield axios_1.default.post(`${baseURL}/v1/booking/flight-orders`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        const bookingData = bookingResponse.data;
        // Save booking to database using Prisma
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming you have user authentication middleware
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }
        const booking = yield prisma.booking.create({
            data: {
                userId: userId,
                referenceId: bookingData.data.id, // Amadeus booking ID
                type: "FLIGHT",
                verified: true,
                status: "CONFIRMED",
                apiResponse: bookingData, // Store full API response
                bookingDetails: flightOffer, // Store essential flight details
                totalAmount: flightOffer.price.total,
                currency: flightOffer.price.currency,
                apiProvider: "AMADEUS",
                apiReferenceId: bookingData.data.id,
                travelers: {
                    create: travelers.map((traveler) => ({
                        firstName: traveler.name.firstName,
                        lastName: traveler.name.lastName,
                        dateOfBirth: new Date(traveler.dateOfBirth),
                        gender: traveler.gender,
                        email: traveler.contact.emailAddress,
                        phone: traveler.contact.phones[0].number,
                        countryCode: traveler.documents[0].issuanceCountry,
                        birthPlace: traveler.documents[0].birthPlace,
                        passportNumber: traveler.documents[0].number,
                        passportExpiry: new Date(traveler.documents[0].expiryDate),
                        issuanceCountry: traveler.documents[0].issuanceCountry,
                        validityCountry: traveler.documents[0].validityCountry,
                        nationality: traveler.documents[0].nationality,
                        issuanceDate: new Date(traveler.documents[0].issuanceDate),
                        issuanceLocation: traveler.documents[0].issuanceLocation,
                    })),
                },
            },
        });
        return res
            .status(200)
            .json({ message: "Flight booked successfully", booking });
    }
    catch (error) {
        console.error("Amadeus Booking API Error:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        return res
            .status(500)
            .json({ message: "Error booking flight", error: error.message });
    }
});
exports.bookFlight = bookFlight;
