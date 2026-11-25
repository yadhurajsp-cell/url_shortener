import express from "express";
import generateShortUrl from "../utils/urlgenerate.js";
import Url from "../models/url.model.js";

const router = express.Router();

router.post("/shorten", async (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (url.length > 2048) {
    return res.status(400).json({ error: "URL is too long" });
  }

  const shortUrl = generateShortUrl();
  const newurl = await Url.create({ originalUrl: url, shortUrl });

  return res.status(201).json({ originalUrl: url, shortUrl: newurl.shortUrl,clicks: newurl.clicks });
});

router.get("/", async (req, res) => {
    const urls = await Url.find();
    return res.status(200).json({
        message: "All URLs retrieved successfully",
        data: urls
    });
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const url = await Url.findById(id);

    if (!url) {
        return res.status(404).json({ error: "URL not found" });
    }
    await Url.findByIdAndDelete(id);

    return res.status(200).json({ message: "URL deleted successfully" });
});

export default router;
