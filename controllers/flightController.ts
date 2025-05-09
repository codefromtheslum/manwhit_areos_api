import { Request, Response } from "express";
import axios from "axios";
import getAmadeusToken from "../utils/getToken";
import { PrismaClient } from "@prisma/client";

const baseURL: string = "https://test.api.amadeus.com";

const prisma = new PrismaClient();

// Search for available flights
// export const searchFlights = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const {
//       originName,
//       destinationName,
//       departureDate,
//       returnDate,
//       adults,
//       travelClass,
//       nonStop,
//       keyword, // new param for autocomplete
//     } = req.query;

//     const token = await getAmadeusToken();

//     // If keyword is present, perform autocomplete and return suggestions
//     if (keyword && typeof keyword === "string") {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword,
//           },
//         }
//       );

//       const suggestions = locationRes.data.data.map((item: any) => ({
//         name: item.name,
//         iataCode: item.iataCode,
//         cityCode: item.cityCode,
//         countryName: item.address?.countryName,
//       }));

//       return res.json(suggestions);
//     }

//     // Otherwise, proceed with flight search as before
//     if (!originName || !destinationName || !departureDate || !adults) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters" });
//     }

//     // Fetch IATA codes for origin and destination
//     const getCode = async (city: string) => {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword: city,
//           },
//         }
//       );
//       const data = locationRes.data?.data?.[0];
//       return data?.iataCode || city;
//     };

//     const originLocationCode = await getCode(originName as string);
//     const destinationLocationCode = await getCode(destinationName as string);

//     const flightRes = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
//       headers: { Authorization: `Bearer ${token}` },
//       params: {
//         originLocationCode,
//         destinationLocationCode,
//         departureDate,
//         returnDate,
//         adults,
//         travelClass,
//         nonStop,
//       },
//     });

//     return res.json(flightRes.data);
//   } catch (error: any) {
//     console.error(
//       "Amadeus API Error:",
//       error?.response?.data || error?.message
//     );
//     return res
//       .status(500)
//       .json({ message: "Error searching flights", error: error?.message });
//   }
// };

// Search for available flights
// export const searchFlights = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const {
//       originName,
//       destinationName,
//       departureDate,
//       returnDate,
//       adults,
//       travelClass,
//       nonStop,
//       keyword, // new param for autocomplete
//     } = req.query;

//     const token = await getAmadeusToken();

//     // Autocomplete: airport/city search
//     if (keyword && typeof keyword === "string") {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword,
//           },
//         }
//       );

//       const suggestions = locationRes.data.data.map((item: any) => ({
//         name: item.name,
//         iataCode: item.iataCode,
//         cityCode: item.cityCode,
//         countryName: item.address?.countryName,
//       }));

//       return res.json(suggestions);
//     }

//     if (!originName || !destinationName || !departureDate || !adults) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters" });
//     }

//     // Helper to get IATA code
//     const getCode = async (city: string) => {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword: city,
//           },
//         }
//       );
//       const data = locationRes.data?.data?.[0];
//       return data?.iataCode || city;
//     };

//     const originLocationCode = await getCode(originName as string);
//     const destinationLocationCode = await getCode(destinationName as string);

//     const flightRes = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
//       headers: { Authorization: `Bearer ${token}` },
//       params: {
//         originLocationCode,
//         destinationLocationCode,
//         departureDate,
//         returnDate,
//         adults,
//         travelClass,
//         nonStop,
//       },
//     });

//     const flightData: any = flightRes.data;

//     // Extract carrier codes
//     const carrierCodes = [
//       ...new Set(
//         flightData.data
//           .flatMap((offer: any) =>
//             offer.itineraries.flatMap((it: any) =>
//               it.segments.map((seg: any) => seg.carrierCode)
//             )
//           )
//       ),
//     ];

//     // Lookup airline names
//     const airlineRes: any = await axios.get(`${baseURL}/v1/reference-data/airlines`, {
//       headers: { Authorization: `Bearer ${token}` },
//       params: {
//         airlineCodes: carrierCodes.join(","),
//       },
//     });

//     const airlines = airlineRes.data.data;

//     // Map carrierCode to airline name
//     const airlineMap: Record<string, string> = {};
//     airlines.forEach((airline: any) => {
//       airlineMap[airline.iataCode] = airline.commonName || airline.businessName;
//     });

//     // Attach airline names to each segment
//     flightData.data.forEach((offer: any) => {
//       offer.itineraries.forEach((itinerary: any) => {
//         itinerary.segments.forEach((segment: any) => {
//           segment.airlineName = airlineMap[segment.carrierCode] || segment.carrierCode;
//         });
//       });
//     });

//     return res.json(flightData);
//   } catch (error: any) {
//     console.error("Amadeus API Error:", error?.response?.data || error?.message);
//     return res.status(500).json({
//       message: "Error searching flights",
//       error: error?.message,
//     });
//   }
// };

// export const searchFlights = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const {
//       originName,
//       destinationName,
//       departureDate,
//       returnDate,
//       adults,
//       travelClass,
//       nonStop,
//       keyword, // new param for autocomplete
//     } = req.query;

//     const token = await getAmadeusToken();

//     // Autocomplete: airport/city search
//     if (keyword && typeof keyword === "string") {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword,
//           },
//         }
//       );

//       const suggestions = locationRes.data.data.map((item: any) => ({
//         name: item.name,
//         iataCode: item.iataCode,
//         cityCode: item.cityCode,
//         countryName: item.address?.countryName,
//         stateCode: item.address?.stateCode,
//         regionCode: item.address?.regionCode,
//       }));

//       return res.json(suggestions);
//     }

//     if (!originName || !destinationName || !departureDate || !adults) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters" });
//     }

//     // Enhanced helper to get IATA code and location details
//     const getLocationDetails = async (city: string) => {
//       const locationRes: any = await axios.get(
//         `${baseURL}/v1/reference-data/locations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             subType: "CITY,AIRPORT",
//             keyword: city,
//           },
//         }
//       );
//       const data = locationRes.data?.data?.[0];
//       return {
//         iataCode: data?.iataCode || city,
//         name: data?.name,
//         cityName: data?.address?.cityName,
//         countryName: data?.address?.countryName,
//         stateCode: data?.address?.stateCode,
//         regionCode: data?.address?.regionCode,
//       };
//     };

//     // Get details for both origin and destination
//     const originLocation = await getLocationDetails(originName as string);
//     const destinationLocation = await getLocationDetails(
//       destinationName as string
//     );

//     const flightRes = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
//       headers: { Authorization: `Bearer ${token}` },
//       params: {
//         originLocationCode: originLocation.iataCode,
//         destinationLocationCode: destinationLocation.iataCode,
//         departureDate,
//         returnDate,
//         adults,
//         travelClass,
//         nonStop,
//       },
//     });

//     const flightData: any = flightRes.data;

//     // Extract carrier codes
//     const carrierCodes = [
//       ...new Set(
//         flightData.data.flatMap((offer: any) =>
//           offer.itineraries.flatMap((it: any) =>
//             it.segments.map((seg: any) => seg.carrierCode)
//           )
//         )
//       ),
//     ];

//     // Lookup airline names
//     const airlineRes: any = await axios.get(
//       `${baseURL}/v1/reference-data/airlines`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           airlineCodes: carrierCodes.join(","),
//         },
//       }
//     );

//     const airlines = airlineRes.data.data;

//     // Map carrierCode to airline name
//     const airlineMap: Record<string, string> = {};
//     airlines.forEach((airline: any) => {
//       airlineMap[airline.iataCode] = airline.commonName || airline.businessName;
//     });

//     // Get details for all locations in the segments
//     const locationCodes = new Set<string>();
//     flightData.data.forEach((offer: any) => {
//       offer.itineraries.forEach((itinerary: any) => {
//         itinerary.segments.forEach((segment: any) => {
//           locationCodes.add(segment.departure.iataCode);
//           locationCodes.add(segment.arrival.iataCode);
//         });
//       });
//     });

//     // Fetch location details individually to avoid parameter length limits
//     const locationMap: Record<string, any> = {};

//     // First, check if we already have origin and destination locations
//     if (originLocation.iataCode) {
//       locationMap[originLocation.iataCode] = originLocation;
//     }
//     if (destinationLocation.iataCode) {
//       locationMap[destinationLocation.iataCode] = destinationLocation;
//     }

//     // Then fetch any remaining locations
//     for (const code of locationCodes) {
//       // Skip if we already have this location
//       if (locationMap[code]) continue;

//       try {
//         const locationRes: any = await axios.get(
//           `${baseURL}/v1/reference-data/locations`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             params: {
//               subType: "CITY,AIRPORT",
//               keyword: code,
//               // Use exact match to get more precise results
//               // "page[limit]": 10,
//             },
//           }
//         );

//         if (
//           locationRes.data &&
//           locationRes.data.data &&
//           locationRes.data.data.length > 0
//         ) {
//           const location = locationRes.data.data[0];
//           locationMap[code] = {
//             name: location.name,
//             cityName: location.address?.cityName,
//             countryName: location.address?.countryName,
//             stateCode: location.address?.stateCode,
//             regionCode: location.address?.regionCode,
//           };
//         } else {
//           locationMap[code] = { name: code };
//         }
//       } catch (err) {
//         console.error(`Could not fetch details for location code ${code}`, err);
//         locationMap[code] = { name: code };
//       }
//     }

//     // Attach airline names and location details to each segment
//     flightData.data.forEach((offer: any) => {
//       offer.itineraries.forEach((itinerary: any) => {
//         itinerary.segments.forEach((segment: any) => {
//           // Add airline name
//           segment.airlineName =
//             airlineMap[segment.carrierCode] || segment.carrierCode;

//           // Add departure location details
//           segment.departure.locationDetails = locationMap[
//             segment.departure.iataCode
//           ] || {
//             name: segment.departure.iataCode,
//           };

//           // Add arrival location details
//           segment.arrival.locationDetails = locationMap[
//             segment.arrival.iataCode
//           ] || {
//             name: segment.arrival.iataCode,
//           };
//         });
//       });
//     });

//     // Add origin and destination details to the response
//     flightData.originDetails = originLocation;
//     flightData.destinationDetails = destinationLocation;

//     return res.json(flightData);
//   } catch (error: any) {
//     console.error(
//       "Amadeus API Error:",
//       error?.response?.data || error?.message
//     );
//     return res.status(500).json({
//       message: "Error searching flights",
//       error: error?.message,
//     });
//   }
// };

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

    // Helper function to get airline logo URL
    const getAirlineLogoUrl = (iataCode: string): string => {
      if (!iataCode) return "";
      return `https://content.airhex.com/content/logos/airlines_${iataCode.toLowerCase()}_50_50_r.png`;
    };

    // Autocomplete: airport/city search
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
        stateCode: item.address?.stateCode,
        regionCode: item.address?.regionCode,
      }));

      return res.json(suggestions);
    }

    if (!originName || !destinationName || !departureDate || !adults) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    // Enhanced helper to get IATA code and location details
    const getLocationDetails = async (city: string) => {
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
      return {
        iataCode: data?.iataCode || city,
        name: data?.name,
        cityName: data?.address?.cityName,
        countryName: data?.address?.countryName,
        stateCode: data?.address?.stateCode,
        regionCode: data?.address?.regionCode,
      };
    };

    // Get details for both origin and destination
    const originLocation = await getLocationDetails(originName as string);
    const destinationLocation = await getLocationDetails(
      destinationName as string
    );

    const flightRes = await axios.get(`${baseURL}/v2/shopping/flight-offers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: originLocation.iataCode,
        destinationLocationCode: destinationLocation.iataCode,
        departureDate,
        returnDate,
        adults,
        travelClass,
        nonStop,
      },
    });

    const flightData: any = flightRes.data;

    // Extract carrier codes
    const carrierCodes = [
      ...new Set(
        flightData.data.flatMap((offer: any) =>
          offer.itineraries.flatMap((it: any) =>
            it.segments.map((seg: any) => seg.carrierCode)
          )
        )
      ),
    ];

    // Lookup airline names
    const airlineRes: any = await axios.get(
      `${baseURL}/v1/reference-data/airlines`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          airlineCodes: carrierCodes.join(","),
        },
      }
    );

    const airlines = airlineRes.data.data;

    // Map carrierCode to airline name and logo URL
    const airlineMap: Record<string, string> = {};
    const airlineLogoMap: Record<string, string> = {};

    airlines.forEach((airline: any) => {
      airlineMap[airline.iataCode] = airline.commonName || airline.businessName;
      airlineLogoMap[airline.iataCode] = getAirlineLogoUrl(airline.iataCode);
    });

    // Get details for all locations in the segments
    const locationCodes = new Set<string>();
    flightData.data.forEach((offer: any) => {
      offer.itineraries.forEach((itinerary: any) => {
        itinerary.segments.forEach((segment: any) => {
          locationCodes.add(segment.departure.iataCode);
          locationCodes.add(segment.arrival.iataCode);
        });
      });
    });

    // Fetch location details individually to avoid parameter length limits
    const locationMap: Record<string, any> = {};

    // First, check if we already have origin and destination locations
    if (originLocation.iataCode) {
      locationMap[originLocation.iataCode] = originLocation;
    }
    if (destinationLocation.iataCode) {
      locationMap[destinationLocation.iataCode] = destinationLocation;
    }

    // Then fetch any remaining locations
    for (const code of locationCodes) {
      // Skip if we already have this location
      if (locationMap[code]) continue;

      try {
        const locationRes: any = await axios.get(
          `${baseURL}/v1/reference-data/locations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              subType: "CITY,AIRPORT",
              keyword: code,
            },
          }
        );

        if (
          locationRes.data &&
          locationRes.data.data &&
          locationRes.data.data.length > 0
        ) {
          const location = locationRes.data.data[0];
          locationMap[code] = {
            name: location.name,
            cityName: location.address?.cityName,
            countryName: location.address?.countryName,
            stateCode: location.address?.stateCode,
            regionCode: location.address?.regionCode,
          };
        } else {
          locationMap[code] = { name: code };
        }
      } catch (err) {
        console.error(`Could not fetch details for location code ${code}`, err);
        locationMap[code] = { name: code };
      }
    }

    // Attach airline names, logos, and location details to each segment
    flightData.data.forEach((offer: any) => {
      offer.itineraries.forEach((itinerary: any) => {
        itinerary.segments.forEach((segment: any) => {
          // Add airline name
          segment.airlineName = airlineMap[segment.carrierCode] || segment.carrierCode;

          // Add airline logo URL safely
          segment.airlineLogo = airlineLogoMap[segment.carrierCode] || "";

          // Add departure location details
          segment.departure.locationDetails = locationMap[segment.departure.iataCode] || {
            name: segment.departure.iataCode,
          };

          // Add arrival location details
          segment.arrival.locationDetails = locationMap[segment.arrival.iataCode] || {
            name: segment.arrival.iataCode,
          };
        });
      });
    });

    // Add origin and destination details to the response
    flightData.originDetails = originLocation;
    flightData.destinationDetails = destinationLocation;

    return res.json(flightData);
  } catch (error: any) {
    console.error(
      "Amadeus API Error:",
      error?.response?.data || error?.message
    );
    return res.status(500).json({
      message: "Error searching flights",
      error: error?.message,
    });
  }
};
