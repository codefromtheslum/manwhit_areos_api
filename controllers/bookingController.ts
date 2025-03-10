import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";

const prisma = new PrismaClient();

const baseURL: string = "https://test.api.amadeus.com";


export const verifyFlightPrice = async (req: Request, res: Response): Promise<any> => {
    try {

    } catch (error: any) {
        return res.status(500).json({
            message: "Error verifying flight price",
            data: error?.message
        })
    }
}

export const bookFlight = async (req: Request, res: Response): Promise<any> => {

    const { userId, flightOffer, travelers } = req.body;

    if (!userId || !flightOffer || !travelers?.length) {
        return res.status(400).json({
            message: "Missing required fields"
        })
    }

    try {
        const token = await getAmadeusToken()

        const bookingResponse: any = await axios.post(`${baseURL}/v1/booking/flight-orders`, {
            data: {
                flightOffers: [flightOffer],
                travelers
            },
        }, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.amadeus+json" }
        })

        const apiResponse = bookingResponse.data
        const apiReferenceId = bookingResponse?.data?.id


        // Storing booking in database
        const booking = await prisma.booking.create({
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
        })

        for (const traveler of travelers) {
            await prisma.traveler.create({
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
            })
        }

        return res.status(200).json({
            message: "Flight booked successfully",
            data: booking
        })

    } catch (error: any) {
        return res.status(500).json({
            message: "Error booking flight",
            data: error?.message
        })
    }
}

