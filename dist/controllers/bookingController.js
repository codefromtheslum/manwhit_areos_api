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
exports.searchBookingById = exports.bookFlight = exports.removeFlightFromCart = exports.addFlightToCart = exports.verifyFlightPrice = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const getToken_1 = __importDefault(require("../utils/getToken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const baseURL = "https://test.api.amadeus.com";
const verifyFlightPrice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { priceFlightOffersBody } = req.body;
        if (!priceFlightOffersBody) {
            return res.status(400).json({ message: "Missing flight offer data" });
        }
        const token = yield (0, getToken_1.default)();
        const response = axios_1.default.get(`${baseURL}/v1/shopping/flight-offers/pricing`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-HTTP-Method-Override": "GET",
            },
        });
        return res.status(200).json({
            message: `Flight price verified successfully`,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error verifying flight price",
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.verifyFlightPrice = verifyFlightPrice;
const addFlightToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const { flightData } = req.body;
        if (!flightData) {
            return res.status(400).json({
                message: `Missing required parameter `,
            });
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                message: `User not found or does not exist`,
            });
        }
        const cartItem = yield prisma.flightCart.create({
            data: {
                userId,
                flightData,
            },
        });
        return res.status(200).json({
            message: `Flight added to cart`,
            data: cartItem,
        });
    }
    catch (error) {
        console.log(`AMADEUS API: `, (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        return res.status(500).json({
            message: `Error occured while adding flight to cart`,
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.addFlightToCart = addFlightToCart;
const removeFlightFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cartId } = req.params;
    try {
        const cartItem = yield prisma.flightCart.findUnique({
            where: { id: cartId },
        });
        if (!cartItem) {
            return res.status(404).json({
                message: `Item not found in cart`,
            });
        }
        yield prisma.flightCart.delete({
            where: { id: cartId },
        });
        return res.status(200).json({
            message: `Flight removed from cart`,
        });
    }
    catch (error) {
        console.log(`AMADEUS API: `, (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        return res.status(500).json({
            message: `Error occured while removing flight from cart`,
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.removeFlightFromCart = removeFlightFromCart;
// export const bookFlight = async (req: any, res: any): Promise<any> => {
//   try {
//     const { userId, transactionId } = req.params;
//     const { travelers} = req.body;
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: User ID missing" });
//     }
//     if (!transactionId) {
//       return res
//         .status(400)
//         .json({ message: "Missing Flutterwave transaction ID" });
//     }
//     if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Travelers data missing or invalid" });
//     }
//     // 1. Verify payment with Flutterwave
//     const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTER_SECRET;
//     const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
//     const flutterwaveRes = await axios.get(verifyUrl, {
//       headers: {
//         Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
//       },
//     });
//     const flutterwaveData: any = flutterwaveRes.data;
//     if (
//       !flutterwaveData ||
//       flutterwaveData.status !== "success" ||
//       flutterwaveData.data.status !== "successful"
//     ) {
//       return res.status(402).json({ message: "Payment not successful" });
//     }
//     // 2. Fetch user's cart items
//     const cartItems = await prisma.flightCart.findMany({
//       where: { userId },
//     });
//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }
//     const token = await getAmadeusToken();
//     const bookings = [];
//     // 3. For each cart item, create booking
//     for (const cartItem of cartItems) {
//       const flightOffer: any = cartItem.flightData;
//       const payload = {
//         data: {
//           type: "flight-order",
//           flightOffers: [flightOffer],
//           travelers: travelers.map((t: any) => ({
//             id: t.id,
//             dateOfBirth: t.dateOfBirth,
//             name: {
//               firstName: t.name.firstName,
//               lastName: t.name.lastName,
//             },
//             gender: t.gender,
//             contact: {
//               emailAddress: t.contact.emailAddress,
//               phones: t.contact.phones,
//             },
//             documents: t.documents.map((doc: any) => ({
//               number: doc.passportNumber || doc.number,
//               documentType: doc.documentType || "PASSPORT",
//               issuanceCountry: doc.issuanceCountry,
//               issuanceLocation: doc.issuanceLocation,
//               issuanceDate: doc.issuanceDate,
//               holder: true,
//               expiryDate: doc.expiryDate,
//               validityCountry: doc.validityCountry,
//               nationality: doc.nationality,
//               birthPlace: doc.birthPlace,
//             })),
//           })),
//           holder: {
//             name: {
//               firstName: travelers[0].name.firstName,
//               lastName: travelers[0].name.lastName,
//             },
//           },
//         },
//       };
//       // Call Amadeus booking API
//       const bookingResponse = await axios.post(
//         `${baseURL}/v1/booking/flight-orders`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       const bookingData: any = bookingResponse.data;
//       // Save booking in DB
//       const booking = await prisma.booking.create({
//         data: {
//           userId,
//           referenceId: bookingData.data.id,
//           type: "FLIGHT",
//           verified: true,
//           status: "CONFIRMED",
//           apiResponse: bookingData,
//           bookingDetails: flightOffer,
//           totalAmount: parseFloat(flightOffer.price.total),
//           currency: flightOffer?.price?.currency,
//           apiProvider: "AMADEUS",
//           apiReferenceId: bookingData.data.id,
//           travelers: {
//             create: travelers.map((traveler: any) => ({
//               firstName: traveler.name.firstName,
//               lastName: traveler.name.lastName,
//               dateOfBirth: new Date(traveler.dateOfBirth),
//               gender: traveler.gender,
//               email: traveler.contact.emailAddress,
//               phone: traveler.contact.phones[0].number,
//               countryCode: traveler.documents[0].issuanceCountry,
//               birthPlace: traveler.documents[0].birthPlace,
//               passportNumber: traveler.documents[0].number,
//               passportExpiry: new Date(traveler.documents[0].expiryDate),
//               issuanceCountry: traveler.documents[0].issuanceCountry,
//               validityCountry: traveler.documents[0].validityCountry,
//               nationality: traveler.documents[0].nationality,
//               issuanceDate: new Date(traveler.documents[0].issuanceDate),
//               issuanceLocation: traveler.documents[0].issuanceLocation,
//             })),
//           },
//         },
//       });
//       bookings.push(booking);
//     }
//     // 4. Clear cart
//     await prisma.flightCart.deleteMany({ where: { userId } });
//     return res.status(200).json({
//       message: "Flight(s) booked successfully",
//       bookings,
//     });
//   } catch (error: any) {
//     console.error("Booking API Error:", error.response?.data || error.message);
//     return res
//       .status(500)
//       .json({ message: "Error booking flight", error: error.message });
//   }
// };
// export const bookFlight = async (req: any, res: any): Promise<any> => {
//   try {
//     const { userId, transactionId } = req.params;
//     const { travelers } = req.body;
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: User ID missing" });
//     }
//     if (!transactionId) {
//       return res.status(400).json({ message: "Missing Flutterwave transaction ID" });
//     }
//     if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
//       return res.status(400).json({ message: "Travelers data missing or invalid" });
//     }
//     // 1. Verify payment with Flutterwave
//     const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTER_SECRET;
//     const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
//     const flutterwaveRes = await axios.get(verifyUrl, {
//       headers: {
//         Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
//       },
//     });
//     const flutterwaveData: any = flutterwaveRes.data;
//     if (
//       !flutterwaveData ||
//       flutterwaveData.status !== "success" ||
//       flutterwaveData.data.status !== "successful"
//     ) {
//       return res.status(402).json({ message: "Payment not successful" });
//     }
//     // 2. Fetch user's cart items
//     const cartItems = await prisma.flightCart.findMany({
//       where: { userId },
//     });
//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }
//     // 3. Get Amadeus token once
//     const token = await getAmadeusToken();
//     console.log("Amadeus token acquired");
//     // Corrected helper function to fetch location details using query parameters
//     async function getLocationDetails(iataCode: string) {
//       try {
//         const response: any = await axios.get(
//           `${baseURL}/v1/reference-data/locations`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             params: {
//               keyword: iataCode,
//               subType: "AIRPORT",
//             },
//           }
//         );
//         const locations = response.data.data;
//         console.log(`Location data for ${iataCode}:`, JSON.stringify(locations, null, 2));
//         if (locations && locations.length > 0) {
//           // Find exact match by iataCode if multiple returned
//           const exactMatch = locations.find((loc: any) => loc.iataCode === iataCode);
//           const location = exactMatch || locations[0];
//           return location;
//         } else {
//           console.warn(`No location data found for IATA code: ${iataCode}`);
//           return null;
//         }
//       } catch (error: any) {
//         console.error(`Failed to fetch location details for ${iataCode}`, error.response?.data || error.message);
//         return null;
//       }
//     }
//     const bookings = [];
//     for (const cartItem of cartItems) {
//       const flightOffer: any = cartItem.flightData;
//       // Extract all unique IATA codes from segments
//       const segments = flightOffer.itineraries.flatMap((i: any) => i.segments);
//       const uniqueIataCodes = new Set<string>();
//       segments.forEach((segment: any) => {
//         uniqueIataCodes.add(segment.departure.iataCode);
//         uniqueIataCodes.add(segment.arrival.iataCode);
//       });
//       console.log("Unique IATA codes extracted:", Array.from(uniqueIataCodes));
//       // Fetch location details for each IATA code
//       const locationDetailsMap: Record<string, any> = {};
//       for (const code of uniqueIataCodes) {
//         const details = await getLocationDetails(code);
//         if (details) {
//           locationDetailsMap[code] = {
//             airportName: details.name,
//             cityName: details.address?.cityName,
//             countryName: details.address?.countryName,
//             countryCode: details.address?.countryCode,
//           };
//         }
//       }
//       console.log("Location details map populated:", locationDetailsMap);
//       // Prepare booking payload
//       const payload = {
//         data: {
//           type: "flight-order",
//           flightOffers: [flightOffer],
//           travelers: travelers.map((t: any) => ({
//             id: t.id,
//             dateOfBirth: t.dateOfBirth,
//             name: {
//               firstName: t.name.firstName,
//               lastName: t.name.lastName,
//             },
//             gender: t.gender,
//             contact: {
//               emailAddress: t.contact.emailAddress,
//               phones: t.contact.phones,
//             },
//             documents: t.documents.map((doc: any) => ({
//               number: doc.passportNumber || doc.number,
//               documentType: doc.documentType || "PASSPORT",
//               issuanceCountry: doc.issuanceCountry,
//               issuanceLocation: doc.issuanceLocation,
//               issuanceDate: doc.issuanceDate,
//               holder: true,
//               expiryDate: doc.expiryDate,
//               validityCountry: doc.validityCountry,
//               nationality: doc.nationality,
//               birthPlace: doc.birthPlace,
//             })),
//           })),
//           holder: {
//             name: {
//               firstName: travelers[0].name.firstName,
//               lastName: travelers[0].name.lastName,
//             },
//           },
//         },
//       };
//       // Call Amadeus booking API
//       const bookingResponse = await axios.post(
//         `${baseURL}/v1/booking/flight-orders`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       const bookingData: any = bookingResponse.data;
//       // Save booking in DB, including location details
//       const booking = await prisma.booking.create({
//         data: {
//           userId,
//           referenceId: bookingData.data.id,
//           type: "FLIGHT",
//           verified: true,
//           status: "CONFIRMED",
//           apiResponse: bookingData,
//           bookingDetails: flightOffer,
//           totalAmount: parseFloat(flightOffer.price.total),
//           currency: flightOffer?.price?.currency,
//           apiProvider: "AMADEUS",
//           apiReferenceId: bookingData.data.id,
//           locationDetails: locationDetailsMap,
//           travelers: {
//             create: travelers.map((traveler: any) => ({
//               firstName: traveler.name.firstName,
//               lastName: traveler.name.lastName,
//               dateOfBirth: new Date(traveler.dateOfBirth),
//               gender: traveler.gender,
//               email: traveler.contact.emailAddress,
//               phone: traveler.contact.phones[0].number,
//               countryCode: traveler.documents[0].issuanceCountry,
//               birthPlace: traveler.documents[0].birthPlace,
//               passportNumber: traveler.documents[0].number,
//               passportExpiry: new Date(traveler.documents[0].expiryDate),
//               issuanceCountry: traveler.documents[0].issuanceCountry,
//               validityCountry: traveler.documents[0].validityCountry,
//               nationality: traveler.documents[0].nationality,
//               issuanceDate: new Date(traveler.documents[0].issuanceDate),
//               issuanceLocation: traveler.documents[0].issuanceLocation,
//             })),
//           },
//         },
//       });
//       bookings.push(booking);
//     }
//     // 4. Clear cart
//     await prisma.flightCart.deleteMany({ where: { userId } });
//     return res.status(200).json({
//       message: "Flight(s) booked successfully",
//       bookings,
//     });
//   } catch (error: any) {
//     console.error("Booking API Error:", error.response?.data || error.message);
//     return res.status(500).json({ message: "Error booking flight", error: error.message });
//   }
// };
const bookFlight = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { userId, transactionId } = req.params;
        const { travelers } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }
        if (!transactionId) {
            return res.status(400).json({ message: "Missing Flutterwave transaction ID" });
        }
        if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
            return res.status(400).json({ message: "Travelers data missing or invalid" });
        }
        // 1. Verify payment with Flutterwave
        const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTER_SECRET;
        const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
        const flutterwaveRes = yield axios_1.default.get(verifyUrl, {
            headers: {
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            },
        });
        const flutterwaveData = flutterwaveRes.data;
        if (!flutterwaveData ||
            flutterwaveData.status !== "success" ||
            flutterwaveData.data.status !== "successful") {
            return res.status(402).json({ message: "Payment not successful" });
        }
        // 2. Fetch user's cart items
        const cartItems = yield prisma.flightCart.findMany({
            where: { userId },
        });
        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        // 3. Get Amadeus token once
        const token = yield (0, getToken_1.default)();
        // console.log("Amadeus token acquired");
        // Helper function to fetch location details using query parameters
        function getLocationDetails(iataCode) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios_1.default.get(`${baseURL}/v1/reference-data/locations`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: {
                            keyword: iataCode,
                            subType: "AIRPORT",
                        },
                    });
                    const locations = response.data.data;
                    // console.log(`Location data for ${iataCode}:`, JSON.stringify(locations, null, 2));
                    if (locations && locations.length > 0) {
                        // Find exact match by iataCode if multiple returned
                        const exactMatch = locations.find((loc) => loc.iataCode === iataCode);
                        const location = exactMatch || locations[0];
                        return location;
                    }
                    else {
                        // console.warn(`No location data found for IATA code: ${iataCode}`);
                        return null;
                    }
                }
                catch (error) {
                    // console.error(`Failed to fetch location details for ${iataCode}`, error.response?.data || error.message);
                    return null;
                }
            });
        }
        // Helper function to fetch airline details dynamically from Amadeus API
        function getAirlineDetails(codes, token) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    if (codes.length === 0)
                        return {};
                    const response = yield axios_1.default.get(`${baseURL}/v1/reference-data/airlines`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { airlineCodes: codes.join(",") },
                    });
                    const airlines = response.data.data;
                    const map = {};
                    airlines.forEach((airline) => {
                        map[airline.iataCode] = airline.commonName || airline.name || airline.iataCode;
                    });
                    return map;
                }
                catch (error) {
                    console.error("Failed to fetch airline details:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                    // fallback: map codes to themselves if API fails
                    const fallbackMap = {};
                    codes.forEach(code => (fallbackMap[code] = code));
                    return fallbackMap;
                }
            });
        }
        const bookings = [];
        for (const cartItem of cartItems) {
            const flightOffer = cartItem.flightData;
            // Extract all unique IATA codes from segments
            const segments = flightOffer.itineraries.flatMap((i) => i.segments);
            const uniqueIataCodes = new Set();
            segments.forEach((segment) => {
                uniqueIataCodes.add(segment.departure.iataCode);
                uniqueIataCodes.add(segment.arrival.iataCode);
            });
            console.log("Unique IATA codes extracted:", Array.from(uniqueIataCodes));
            // Fetch location details for each IATA code
            const locationDetailsMap = {};
            for (const code of uniqueIataCodes) {
                const details = yield getLocationDetails(code);
                if (details) {
                    locationDetailsMap[code] = {
                        airportName: details.name,
                        cityName: (_a = details.address) === null || _a === void 0 ? void 0 : _a.cityName,
                        countryName: (_b = details.address) === null || _b === void 0 ? void 0 : _b.countryName,
                        countryCode: (_c = details.address) === null || _c === void 0 ? void 0 : _c.countryCode,
                    };
                }
            }
            // console.log("Location details map populated:", locationDetailsMap);
            // Extract unique airline codes from flight segments
            const uniqueAirlineCodes = new Set();
            segments.forEach((segment) => {
                if (segment.carrierCode)
                    uniqueAirlineCodes.add(segment.carrierCode);
                if (segment.operatingCarrierCode)
                    uniqueAirlineCodes.add(segment.operatingCarrierCode);
            });
            console.log("Unique airline codes extracted:", Array.from(uniqueAirlineCodes));
            // Fetch airline names from Amadeus API dynamically
            const airlineDetailsMap = yield getAirlineDetails(Array.from(uniqueAirlineCodes), token);
            // console.log("Airline details map populated:", airlineDetailsMap);
            // Prepare booking payload
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
                        documents: t.documents.map((doc) => ({
                            number: doc.passportNumber || doc.number,
                            documentType: doc.documentType || "PASSPORT",
                            issuanceCountry: doc.issuanceCountry,
                            issuanceLocation: doc.issuanceLocation,
                            issuanceDate: doc.issuanceDate,
                            holder: true,
                            expiryDate: doc.expiryDate,
                            validityCountry: doc.validityCountry,
                            nationality: doc.nationality,
                            birthPlace: doc.birthPlace,
                        })),
                    })),
                    holder: {
                        name: {
                            firstName: travelers[0].name.firstName,
                            lastName: travelers[0].name.lastName,
                        },
                    },
                },
            };
            // Call Amadeus booking API
            const bookingResponse = yield axios_1.default.post(`${baseURL}/v1/booking/flight-orders`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const bookingData = bookingResponse.data;
            // Save booking in DB, including location and airline details
            const booking = yield prisma.booking.create({
                data: {
                    userId,
                    referenceId: bookingData.data.id,
                    type: "FLIGHT",
                    verified: true,
                    status: "CONFIRMED",
                    apiResponse: bookingData,
                    bookingDetails: flightOffer,
                    totalAmount: parseFloat(flightOffer.price.total),
                    currency: (_d = flightOffer === null || flightOffer === void 0 ? void 0 : flightOffer.price) === null || _d === void 0 ? void 0 : _d.currency,
                    apiProvider: "AMADEUS",
                    apiReferenceId: bookingData.data.id,
                    locationDetails: locationDetailsMap,
                    airlineDetails: airlineDetailsMap, // <-- Automatically fetched airline names here
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
            bookings.push(booking);
        }
        // 4. Clear cart
        yield prisma.flightCart.deleteMany({ where: { userId } });
        return res.status(200).json({
            message: "Flight(s) booked successfully",
            bookings,
        });
    }
    catch (error) {
        console.error("Booking API Error:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        return res.status(500).json({ message: "Error booking flight", error: error.message });
    }
});
exports.bookFlight = bookFlight;
const searchBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try { }
    catch (error) {
        return res.status(500).json({
            message: `Error occured while searching booking`,
            data: (error === null || error === void 0 ? void 0 : error.message) || "Error occured"
        });
    }
});
exports.searchBookingById = searchBookingById;
