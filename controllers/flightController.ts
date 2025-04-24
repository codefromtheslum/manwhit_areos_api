import { Request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";
import { PrismaClient } from "@prisma/client";

const baseURL: string = "https://test.api.amadeus.com";

const prisma = new PrismaClient();

// Search for available flights
export const searchFlights = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      originName,
      destinationName,
      departureDate,
      returnDate,
      adults,
      travelClass,
      nonStop,
      keyword, // new param for autocomplete
    } = req.query;

    const token = await getAmadeusToken();

    // If keyword is present, perform autocomplete and return suggestions
    if (keyword && typeof keyword === "string") {
      const locationRes: any = await axios.get(
        `${baseURL}/v1/reference-data/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            subType: "CITY,AIRPORT",
            keyword,
          },
        }
      );

      const suggestions = locationRes.data.data.map((item: any) => ({
        name: item.name,
        iataCode: item.iataCode,
        cityCode: item.cityCode,
        countryName: item.address?.countryName,
      }));

      return res.json(suggestions);
    }

    // Otherwise, proceed with flight search as before
    if (!originName || !destinationName || !departureDate || !adults) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    // Fetch IATA codes for origin and destination
    const getCode = async (city: string) => {
      const locationRes: any = await axios.get(
        `${baseURL}/v1/reference-data/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            subType: "CITY,AIRPORT",
            keyword: city,
          },
        }
      );
      const data = locationRes.data?.data?.[0];
      return data?.iataCode || city;
    };

    const originLocationCode = await getCode(originName as string);
    const destinationLocationCode = await getCode(destinationName as string);

    const flightRes = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
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
  } catch (error: any) {
    console.error(
      "Amadeus API Error:",
      error?.response?.data || error?.message
    );
    return res
      .status(500)
      .json({ message: "Error searching flights", error: error?.message });
  }
};


