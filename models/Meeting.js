const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    area: { type: String, required: true }, // 📍 연남동, 성수동 등
    meetingDate: { type: Date, required: true },
    maxParticipants: { type: Number, required: true, default: 2 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["recruit", "full", "completed"],
      default: "recruit",
    },
    tags: [String], // ['조용한카페', '주차가능']
    congestionLevel: {
      type: String,
      enum: ["여유", "보통", "혼잡"],
      default: "보통",
    },
  },
  {
    timestamps: true,
  },
);

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;
