CREATE TABLE "Preference" (
 "userId" TEXT NOT NULL,
 "emailUpdates" BOOLEAN NOT NULL DEFAULT false,
 "productAnnouncements" BOOLEAN NOT NULL DEFAULT false,
 CONSTRAINT "Preference_pkey" PRIMARY KEY ("userId"),
 CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
