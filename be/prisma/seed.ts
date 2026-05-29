import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../src/config/prisma";

// Seed script to load food.csv into the database
// Run with: npx ts-node prisma/seed.ts

interface FoodRecord {
  Category: string;
  Description: string;
  "Nutrient Data Bank Number": string;
  "Data.Alpha Carotene": string;
  "Data.Beta Carotene": string;
  "Data.Beta Cryptoxanthin": string;
  "Data.Carbohydrate": string;
  "Data.Cholesterol": string;
  "Data.Choline": string;
  "Data.Fiber": string;
  "Data.Lutein and Zeaxanthin": string;
  "Data.Lycopene": string;
  "Data.Niacin": string;
  "Data.Protein": string;
  "Data.Retinol": string;
  "Data.Riboflavin": string;
  "Data.Selenium": string;
  "Data.Sugar Total": string;
  "Data.Thiamin": string;
  "Data.Water": string;
  "Data.Fat.Monosaturated Fat": string;
  "Data.Fat.Polysaturated Fat": string;
  "Data.Fat.Saturated Fat": string;
  "Data.Fat.Total Lipid": string;
  "Data.Major Minerals.Calcium": string;
  "Data.Major Minerals.Copper": string;
  "Data.Major Minerals.Iron": string;
  "Data.Major Minerals.Magnesium": string;
  "Data.Major Minerals.Phosphorus": string;
  "Data.Major Minerals.Potassium": string;
  "Data.Major Minerals.Sodium": string;
  "Data.Major Minerals.Zinc": string;
  "Data.Vitamins.Vitamin A - RAE": string;
  "Data.Vitamins.Vitamin B12": string;
  "Data.Vitamins.Vitamin B6": string;
  "Data.Vitamins.Vitamin C": string;
  "Data.Vitamins.Vitamin E": string;
  "Data.Vitamins.Vitamin K": string;
}

async function seed() {
  console.log("🌱 Starting database seed...");

  const csvPath = path.join(__dirname, "../../database/food.csv");
  const foods: any[] = [];

  try {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: FoodRecord) => {
        foods.push({
          category: row.Category,
          description: row.Description,
          nutrientDataBankNumber: BigInt(row["Nutrient Data Bank Number"]),
          alphaCarotene: row["Data.Alpha Carotene"] ? parseFloat(row["Data.Alpha Carotene"]) : null,
          betaCarotene: row["Data.Beta Carotene"] ? parseFloat(row["Data.Beta Carotene"]) : null,
          betaCryptoxanthin: row["Data.Beta Cryptoxanthin"] ? parseFloat(row["Data.Beta Cryptoxanthin"]) : null,
          luteinZeaxanthin: row["Data.Lutein and Zeaxanthin"] ? parseFloat(row["Data.Lutein and Zeaxanthin"]) : null,
          lycopene: row["Data.Lycopene"] ? parseFloat(row["Data.Lycopene"]) : null,
          retinol: row["Data.Retinol"] ? parseFloat(row["Data.Retinol"]) : null,
          carbohydrate: row["Data.Carbohydrate"] ? parseFloat(row["Data.Carbohydrate"]) : null,
          protein: row["Data.Protein"] ? parseFloat(row["Data.Protein"]) : null,
          totalLipid: row["Data.Fat.Total Lipid"] ? parseFloat(row["Data.Fat.Total Lipid"]) : null,
          sugarTotal: row["Data.Sugar Total"] ? parseFloat(row["Data.Sugar Total"]) : null,
          fiber: row["Data.Fiber"] ? parseFloat(row["Data.Fiber"]) : null,
          cholesterol: row["Data.Cholesterol"] ? parseFloat(row["Data.Cholesterol"]) : null,
          water: row["Data.Water"] ? parseFloat(row["Data.Water"]) : null,
          choline: row["Data.Choline"] ? parseFloat(row["Data.Choline"]) : null,
          monoFat: row["Data.Fat.Monosaturated Fat"] ? parseFloat(row["Data.Fat.Monosaturated Fat"]) : null,
          polyFat: row["Data.Fat.Polysaturated Fat"] ? parseFloat(row["Data.Fat.Polysaturated Fat"]) : null,
          saturatedFat: row["Data.Fat.Saturated Fat"] ? parseFloat(row["Data.Fat.Saturated Fat"]) : null,
          calcium: row["Data.Major Minerals.Calcium"] ? parseFloat(row["Data.Major Minerals.Calcium"]) : null,
          copper: row["Data.Major Minerals.Copper"] ? parseFloat(row["Data.Major Minerals.Copper"]) : null,
          iron: row["Data.Major Minerals.Iron"] ? parseFloat(row["Data.Major Minerals.Iron"]) : null,
          magnesium: row["Data.Major Minerals.Magnesium"] ? parseFloat(row["Data.Major Minerals.Magnesium"]) : null,
          phosphorus: row["Data.Major Minerals.Phosphorus"] ? parseFloat(row["Data.Major Minerals.Phosphorus"]) : null,
          potassium: row["Data.Major Minerals.Potassium"] ? parseFloat(row["Data.Major Minerals.Potassium"]) : null,
          sodium: row["Data.Major Minerals.Sodium"] ? parseFloat(row["Data.Major Minerals.Sodium"]) : null,
          zinc: row["Data.Major Minerals.Zinc"] ? parseFloat(row["Data.Major Minerals.Zinc"]) : null,
          vitaminARae: row["Data.Vitamins.Vitamin A - RAE"] ? parseFloat(row["Data.Vitamins.Vitamin A - RAE"]) : null,
          vitaminB12: row["Data.Vitamins.Vitamin B12"] ? parseFloat(row["Data.Vitamins.Vitamin B12"]) : null,
          vitaminB6: row["Data.Vitamins.Vitamin B6"] ? parseFloat(row["Data.Vitamins.Vitamin B6"]) : null,
          vitaminC: row["Data.Vitamins.Vitamin C"] ? parseFloat(row["Data.Vitamins.Vitamin C"]) : null,
          vitaminE: row["Data.Vitamins.Vitamin E"] ? parseFloat(row["Data.Vitamins.Vitamin E"]) : null,
          vitaminK: row["Data.Vitamins.Vitamin K"] ? parseFloat(row["Data.Vitamins.Vitamin K"]) : null,
          niacin: row["Data.Niacin"] ? parseFloat(row["Data.Niacin"]) : null,
          riboflavin: row["Data.Riboflavin"] ? parseFloat(row["Data.Riboflavin"]) : null,
          selenium: row["Data.Selenium"] ? parseFloat(row["Data.Selenium"]) : null,
          thiamin: row["Data.Thiamin"] ? parseFloat(row["Data.Thiamin"]) : null,
        });
      })
      .on("end", async () => {
        console.log(`📦 Loaded ${foods.length} foods from CSV`);

        // Clear existing data
        await prisma.food.deleteMany({});
        console.log("🗑️  Cleared existing food data");

        // Batch insert for performance
        const batchSize = 100;
        for (let i = 0; i < foods.length; i += batchSize) {
          const batch = foods.slice(i, i + batchSize);
          await prisma.food.createMany({
            data: batch,
            skipDuplicates: true,
          });
          console.log(`✅ Inserted batch ${Math.ceil((i + batchSize) / batchSize)} / ${Math.ceil(foods.length / batchSize)}`);
        }

        console.log(`✨ Successfully seeded ${foods.length} foods into database!`);
        process.exit(0);
      })
      .on("error", (error) => {
        console.error("❌ Error reading CSV:", error);
        process.exit(1);
      });
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
