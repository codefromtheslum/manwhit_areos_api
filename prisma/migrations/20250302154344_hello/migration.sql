-- CreateTable
CREATE TABLE "Traveler" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "birthPlace" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "issuanceCountry" TEXT,
    "validityCountry" TEXT,
    "nationality" TEXT,
    "issuanceDate" TIMESTAMP(3),
    "issuanceLocation" TEXT,

    CONSTRAINT "Traveler_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Traveler" ADD CONSTRAINT "Traveler_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
