import csv from "csv-parser";

export const parseCsv = async (csvData) => {
  const reviews = [];

  await new Promise((resolve, reject) => {
    csvData
      .pipe(csv())
      .on("data", (data) => reviews.push(data))
      .on("end", () => resolve())
      .on("error", (error) => reject(error));
  });

  return reviews;
};
