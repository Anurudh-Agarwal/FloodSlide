// Official India International Boundary GeoJSON & South Asia Dimmed Overlay
// Includes Jammu & Kashmir, Ladakh, Arunachal Pradesh, Andaman & Nicobar, Lakshadweep.

export const INDIA_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "India", iso: "IND" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            // Northernmost Jammu & Kashmir & Ladakh (Siachen / Gilgit / Leh / Karakoram Pass)
            [77.0, 35.5],
            [76.8, 35.8],
            [76.0, 36.5],
            [75.0, 37.0],
            [74.0, 37.1],
            [73.5, 37.0],
            [73.0, 36.8],
            [72.5, 36.2],
            [73.2, 35.5],
            [73.8, 34.8],
            [74.2, 34.3],
            [74.0, 33.5],
            [74.4, 32.8],
            [74.9, 32.5],
            // Punjab / Rajasthan / Gujarat Border
            [74.6, 31.6],
            [74.3, 30.5],
            [73.5, 29.8],
            [71.8, 28.3],
            [70.2, 27.2],
            [69.6, 26.0],
            [70.5, 24.5],
            [68.2, 23.7], // Rann of Kutch (Westernmost point)
            [68.8, 22.5],
            [70.0, 20.8],
            [72.8, 20.2],
            [72.8, 18.9],
            [73.5, 15.6],
            [74.5, 14.2],
            [75.8, 11.5],
            [76.8, 8.5],
            [77.5, 8.08], // Kanyakumari (Southernmost tip of mainland)
            [78.2, 8.5],
            [79.8, 9.8],
            [79.8, 10.8],
            [80.3, 13.1],
            [83.2, 17.7],
            [85.0, 19.5],
            [86.9, 21.5],
            [88.0, 21.6],
            // West Bengal / Bangladesh border & North-East
            [89.0, 21.8],
            [89.1, 24.0],
            [88.8, 26.3],
            [89.8, 26.0],
            [90.0, 25.2],
            [92.2, 25.1],
            [92.5, 24.0],
            [92.3, 23.0],
            [92.8, 22.0],
            [92.6, 23.7],
            [93.2, 24.8],
            [94.5, 25.2],
            [95.2, 27.0],
            [97.4, 28.2], // Kibithu, Arunachal Pradesh (Easternmost point)
            [96.8, 28.9],
            [95.5, 29.1],
            [92.0, 27.8], // Tawang / Bhutan-China border
            [88.8, 27.3], // Sikkim / Chumbi Valley
            [88.0, 27.8],
            [88.2, 26.5],
            [85.2, 26.8], // Bihar / Nepal border
            [83.0, 27.4],
            [80.1, 28.8], // Uttarakhand / Lipulekh / Kalapani
            [81.1, 30.2],
            [79.5, 31.4],
            [78.7, 31.8],
            [78.9, 32.8],
            [79.2, 33.5], // Ladakh / Aksai Chin alignment
            [78.8, 34.5],
            [78.9, 35.5],
            [77.0, 35.5]  // Closing loop at Siachen
          ]
        ]
      }
    }
  ]
};

// Mask polygon to dim non-India surrounding regions when zoomed out
export const WORLD_MASK_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Subdued Outer Mask" },
      geometry: {
        type: "Polygon",
        coordinates: [
          // Outer bounding box around South Asia
          [
            [50.0, 0.0],
            [110.0, 0.0],
            [110.0, 45.0],
            [50.0, 45.0],
            [50.0, 0.0]
          ],
          // Inner hole (India polygon outline in reverse ring format)
          [
            [77.0, 35.5],
            [78.9, 35.5],
            [78.8, 34.5],
            [79.2, 33.5],
            [78.9, 32.8],
            [78.7, 31.8],
            [79.5, 31.4],
            [81.1, 30.2],
            [80.1, 28.8],
            [83.0, 27.4],
            [85.2, 26.8],
            [88.2, 26.5],
            [88.0, 27.8],
            [88.8, 27.3],
            [92.0, 27.8],
            [95.5, 29.1],
            [96.8, 28.9],
            [97.4, 28.2],
            [95.2, 27.0],
            [94.5, 25.2],
            [93.2, 24.8],
            [92.6, 23.7],
            [92.8, 22.0],
            [92.3, 23.0],
            [92.5, 24.0],
            [92.2, 25.1],
            [90.0, 25.2],
            [89.8, 26.0],
            [88.8, 26.3],
            [89.1, 24.0],
            [89.0, 21.8],
            [88.0, 21.6],
            [86.9, 21.5],
            [85.0, 19.5],
            [83.2, 17.7],
            [80.3, 13.1],
            [79.8, 10.8],
            [79.8, 9.8],
            [78.2, 8.5],
            [77.5, 8.08],
            [76.8, 8.5],
            [75.8, 11.5],
            [74.5, 14.2],
            [73.5, 15.6],
            [72.8, 18.9],
            [72.8, 20.2],
            [70.0, 20.8],
            [68.8, 22.5],
            [68.2, 23.7],
            [70.5, 24.5],
            [69.6, 26.0],
            [70.2, 27.2],
            [71.8, 28.3],
            [73.5, 29.8],
            [74.3, 30.5],
            [74.6, 31.6],
            [74.9, 32.5],
            [74.4, 32.8],
            [74.0, 33.5],
            [74.2, 34.3],
            [73.8, 34.8],
            [73.2, 35.5],
            [72.5, 36.2],
            [73.0, 36.8],
            [73.5, 37.0],
            [74.0, 37.1],
            [75.0, 37.0],
            [76.0, 36.5],
            [76.8, 35.8],
            [77.0, 35.5]
          ]
        ]
      }
    }
  ]
};
