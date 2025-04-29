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


export const bookFlight = async (req: any, res: any): Promise<any> => {
  try {
    const { flightOffer, travelers, transaction_id } = req.body;
    const { userId } = req.params;

    // Validate input
    if (
      !flightOffer ||
      !travelers ||
      !Array.isArray(travelers) ||
      travelers.length === 0 ||
      !transaction_id
    ) {
      return res.status(400).json({
        message: "Missing flightOffer, travelers, or transaction_id",
      });
    }

    // Verify payment with Flutterwave
    const FLW_SECRET_KEY = process.env.FLUTTER_SECRET!; // Your Flutterwave secret key in env
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

    const flutterwaveResponse = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTER_SECRET!}`,
      },
    });

    const paymentData: any = flutterwaveResponse.data;

    if (
      !paymentData ||
      paymentData.status !== "success" ||
      paymentData.data.status !== "successful"
    ) {
      return res.status(402).json({ message: "Payment not successful" });
    }

    // Payment is successful, proceed with Amadeus booking

    const token = await getAmadeusToken();

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
        totalAmount: parseInt(flightOffer.price.total),
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

    // Clean up user's cart after booking
    await prisma.flightCart.deleteMany({ where: { userId } });

    return res
      .status(200)
      .json({ message: "Flight booked successfully", booking });
  } catch (error: any) {
    console.error(
      "Booking API Error:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ message: "Error booking flight", error: error.message });
  }
};

