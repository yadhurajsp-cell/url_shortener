import mongoose from "mongoose";

const urlschema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Url = mongoose.model("Url", urlschema);

export default Url;