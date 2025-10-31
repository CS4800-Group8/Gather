-- CreateTable
CREATE TABLE "FavoriteAPIRecipe" (
    "userId" INTEGER NOT NULL,
    "apiId" TEXT NOT NULL,

    CONSTRAINT "FavoriteAPIRecipe_pkey" PRIMARY KEY ("userId","apiId")
);

-- AddForeignKey
ALTER TABLE "FavoriteAPIRecipe" ADD CONSTRAINT "FavoriteAPIRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
