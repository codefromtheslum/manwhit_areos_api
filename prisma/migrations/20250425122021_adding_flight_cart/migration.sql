-- CreateTable
CREATE TABLE "FlightCart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flightData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightCart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlightCart" ADD CONSTRAINT "FlightCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
