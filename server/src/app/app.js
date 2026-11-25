import express from "express";
import cors from "cors";
import router from "../routes/url.routes.js";
import Url from "../models/url.model.js";
import config from "../config/config.js";

const app = express();
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json());
app.use("/api/url", router);

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.get("/:code", async (req, res) => {
  const { code } = req.params;
  const url = await Url.findOne({ shortUrl: code });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.redirect(302, url.originalUrl);

  url.clicks += 1;
  await url.save();
});

export default app;