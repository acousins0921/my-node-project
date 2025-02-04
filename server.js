require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Middleware to allow JSON requests
app.use(express.json());

// Endpoint to fetch troubleshooting data from Notion
app.get("/api/troubleshooting", async (req, res) => {
  try {
    const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

    const response = await axios.post(url, {}, {
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Notion Data Fetched Successfully!");

    // Extract issue and solution while handling missing values
    const results = response.data.results.map(page => {
      const issue = page.properties["Issue"]?.title?.[0]?.text?.content || "Unknown Issue";
      const solution = page.properties["Solution"]?.rich_text?.[0]?.text?.content || "No solution provided.";
      return { issue, solution };
    });

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching Notion data:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch data from Notion" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
