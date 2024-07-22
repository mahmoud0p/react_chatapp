-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('Delivered', 'Seen');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "status" "message_status" NOT NULL DEFAULT 'Delivered';
