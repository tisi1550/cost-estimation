const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MODEL_API_URL = "https://ml-time-api-1000212396435.us-central1.run.app/predict_time";

app.post("/api/predict-time", async (req, res) => {
    try {
      const response = await fetch(MODEL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
  
      const result = await response.json();
      res.json({ estimated_time: result.training_time_seconds });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
