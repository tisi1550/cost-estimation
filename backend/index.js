const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

app.post("/api/predict-time", async (req, res) => {
  try {
    const response = await fetch(process.env.PREDICT_TIME, {
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

app.post("/api/predict-cost", async (req, res) => {
  try {
    const response = await fetch(process.env.PREDICT_COST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await response.json();
    res.json({ estimated_cost: result.training_cost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch prediction" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
