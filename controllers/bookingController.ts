import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";
import env from "dotenv";
env.config();

const prisma = new PrismaClient();

const baseURL: string = "https://test.api.amadeus.com";

export const verifyFlightPrice = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { priceFlightOffersBody } = req.body;

    if (!priceFlightOffersBody) {
      return res.status(400).json({ message: "Missing flight offer data" });
    }

    const token = await getAmadeusToken();

    const response: any = axios.get(
      `${baseURL}/v1/shopping/flight-offers/pricing`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-HTTP-Method-Override": "GET",
        },
      }
    );

    return res.status(200).json({
      message: `Flight price verified successfully`,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error verifying flight price",
      data: error?.message,
    });
  }
};

export const addFlightToCart = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;
    const { flightData } = req.body;

    if (!flightData) {
      return res.status(400).json({
        message: `Missing required parameter `,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: `User not found or does not exist`,
      });
    }

    const cartItem = await prisma.flightCart.create({
      data: {
        userId,
        flightData,
      },
    });

    return res.status(200).json({
      message: `Flight added to cart`,
      data: cartItem,
    });
  } catch (error: any) {
    console.log(`AMADEUS API: `, error?.response?.data);
    return res.status(500).json({
      message: `Error occured while adding flight to cart`,
      data: error?.message,
    });
  }
};

export const removeFlightFromCart = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { cartId } = req.params;
  try {
    const cartItem = await prisma.flightCart.findUnique({
      where: { id: cartId },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: `Item not found in cart`,
      });
    }

    await prisma.flightCart.delete({
      where: { id: cartId },
    });

    return res.status(200).json({
      message: `Flight removed from cart`,
    });
  } catch (error: any) {
    console.log(`AMADEUS API: `, error?.response?.data);
    return res.status(500).json({
      message: `Error occured while removing flight from cart`,
      data: error?.message,
    });
  }
};

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


export const bookFlight = async (req: any, res: any): Promise<any> => {
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

    const flutterwaveRes = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    const flutterwaveData: any = flutterwaveRes.data;

    if (
      !flutterwaveData ||
      flutterwaveData.status !== "success" ||
      flutterwaveData.data.status !== "successful"
    ) {
      return res.status(402).json({ message: "Payment not successful" });
    }

    // 2. Fetch user's cart items
    const cartItems = await prisma.flightCart.findMany({
      where: { userId },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 3. Get Amadeus token once
    const token = await getAmadeusToken();
    // console.log("Amadeus token acquired");

    // Helper function to fetch location details using query parameters
    async function getLocationDetails(iataCode: string) {
      try {
        const response: any = await axios.get(
          `${baseURL}/v1/reference-data/locations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              keyword: iataCode,
              subType: "AIRPORT",
            },
          }
        );

        const locations = response.data.data;
        // console.log(`Location data for ${iataCode}:`, JSON.stringify(locations, null, 2));

        if (locations && locations.length > 0) {
          // Find exact match by iataCode if multiple returned
          const exactMatch = locations.find((loc: any) => loc.iataCode === iataCode);
          const location = exactMatch || locations[0];
          return location;
        } else {
          // console.warn(`No location data found for IATA code: ${iataCode}`);
          return null;
        }
      } catch (error: any) {
        // console.error(`Failed to fetch location details for ${iataCode}`, error.response?.data || error.message);
        return null;
      }
    }

    // Helper function to fetch airline details dynamically from Amadeus API
    async function getAirlineDetails(codes: string[], token: string): Promise<Record<string, string>> {
      try {
        if (codes.length === 0) return {};
        const response: any = await axios.get(`${baseURL}/v1/reference-data/airlines`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { airlineCodes: codes.join(",") },
        });

        const airlines = response.data.data;
        const map: Record<string, string> = {};

        airlines.forEach((airline: any) => {
          map[airline.iataCode] = airline.commonName || airline.name || airline.iataCode;
        });

        return map;
      } catch (error: any) {
        console.error("Failed to fetch airline details:", error.response?.data || error.message);
        // fallback: map codes to themselves if API fails
        const fallbackMap: Record<string, string> = {};
        codes.forEach(code => (fallbackMap[code] = code));
        return fallbackMap;
      }
    }

    const bookings = [];

    for (const cartItem of cartItems) {
      const flightOffer: any = cartItem.flightData;

      // Extract all unique IATA codes from segments
      const segments = flightOffer.itineraries.flatMap((i: any) => i.segments);
      const uniqueIataCodes = new Set<string>();
      segments.forEach((segment: any) => {
        uniqueIataCodes.add(segment.departure.iataCode);
        uniqueIataCodes.add(segment.arrival.iataCode);
      });

      console.log("Unique IATA codes extracted:", Array.from(uniqueIataCodes));

      // Fetch location details for each IATA code
      const locationDetailsMap: Record<string, any> = {};
      for (const code of uniqueIataCodes) {
        const details = await getLocationDetails(code);
        if (details) {
          locationDetailsMap[code] = {
            airportName: details.name,
            cityName: details.address?.cityName,
            countryName: details.address?.countryName,
            countryCode: details.address?.countryCode,
          };
        }
      }

      // console.log("Location details map populated:", locationDetailsMap);

      // Extract unique airline codes from flight segments
      const uniqueAirlineCodes = new Set<string>();
      segments.forEach((segment: any) => {
        if (segment.carrierCode) uniqueAirlineCodes.add(segment.carrierCode);
        if (segment.operatingCarrierCode) uniqueAirlineCodes.add(segment.operatingCarrierCode);
      });

      console.log("Unique airline codes extracted:", Array.from(uniqueAirlineCodes));

      // Fetch airline names from Amadeus API dynamically
      const airlineDetailsMap = await getAirlineDetails(Array.from(uniqueAirlineCodes), token);

      // console.log("Airline details map populated:", airlineDetailsMap);

      // Prepare booking payload
      const payload = {
        data: {
          type: "flight-order",
          flightOffers: [flightOffer],
          travelers: travelers.map((t: any) => ({
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
            documents: t.documents.map((doc: any) => ({
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
      const bookingResponse = await axios.post(
        `${baseURL}/v1/booking/flight-orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bookingData: any = bookingResponse.data;

      // Save booking in DB, including location and airline details
      const booking = await prisma.booking.create({
        data: {
          userId,
          referenceId: bookingData.data.id,
          type: "FLIGHT",
          verified: true,
          status: "CONFIRMED",
          apiResponse: bookingData,
          bookingDetails: flightOffer,
          totalAmount: parseFloat(flightOffer.price.total),
          currency: flightOffer?.price?.currency,
          apiProvider: "AMADEUS",
          apiReferenceId: bookingData.data.id,
          locationDetails: locationDetailsMap,
          airlineDetails: airlineDetailsMap, // <-- Automatically fetched airline names here
          travelers: {
            create: travelers.map((traveler: any) => ({
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
    await prisma.flightCart.deleteMany({ where: { userId } });

    return res.status(200).json({
      message: "Flight(s) booked successfully",
      bookings,
    });
  } catch (error: any) {
    console.error("Booking API Error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Error booking flight", error: error.message });
  }
};

export const searchBookingById = async (req: Request, res: Response): Promise<any> => {
  try{}catch(error: any){
    return res.status(500).json({
      message: `Error occured while searching booking`,
      data: error?.message || "Error occured"
    })
  }
}