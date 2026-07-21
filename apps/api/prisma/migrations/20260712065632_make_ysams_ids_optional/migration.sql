-- DropIndex
DROP INDEX "TicketType_showId_ysamsPoolId_key";

-- AlterTable
ALTER TABLE "Show" ALTER COLUMN "ysamsId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TicketType" ALTER COLUMN "ysamsPoolId" DROP NOT NULL;
