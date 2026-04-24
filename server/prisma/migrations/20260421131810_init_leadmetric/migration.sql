-- CreateTable
CREATE TABLE "LeadMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "leads" INTEGER NOT NULL,
    "conversionRate" REAL NOT NULL,
    "revenue" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
