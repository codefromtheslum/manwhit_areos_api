import { Request, request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";

const baseURL: string = "https://test.api.amadeus.com";

// Search for available flights
export const searchFlights = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      travelClass,
      nonStop,
    } = req.query;

    if (
      !originLocationCode ||
      !destinationLocationCode ||
      !departureDate ||
      !returnDate ||
      !adults ||
      !nonStop
    ) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    const token = await getAmadeusToken();
    const response = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
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

// Look up flight pricing
export const searchFlightLocation = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { subType, keyword } = req.query;

    if (!subType || !keyword) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const token = await getAmadeusToken();

    const response = await axios.get(`${baseURL}/v1/reference-data/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        subType, // AIRPORT || CITY
        keyword, // County Code ?? NYC ?? SFO ?? ATL ?? DEN
      },
    });

    return res.json(response.data);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error searching flight price",
      data: error?.message,
    });
  }
};
