import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";

const prisma = new PrismaClient();

const baseURL: string = "https://test.api.amadeus.com";

export const verifyFlightPrice = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
  } catch (error: any) {
    return res.status(500).json({
      message: "Error verifying flight price",
      data: error?.message,
    });
  }
};

export const bookFlight = async (req: any, res: any): Promise<any> => {
  try {
    const { flightOffer, travelers } = req.body;

    if (
      !flightOffer ||
      !travelers ||
      !Array.isArray(travelers) ||
      travelers.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing flightOffer or travelers data" });
    }

    const token = await getAmadeusToken();

    // Construct the booking payload
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
          documents: t.documents,
        })),
      },
    };

    // Make the booking request to Amadeus
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

    // Save booking to database using Prisma
    const userId = req.user?.id; // Assuming you have user authentication middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const booking = await prisma.booking.create({
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

    return res
      .status(200)
      .json({ message: "Flight booked successfully", booking });
  } catch (error: any) {
    console.error(
      "Amadeus Booking API Error:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ message: "Error booking flight", error: error.message });
  }
};
