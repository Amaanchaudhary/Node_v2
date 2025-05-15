import mongoose from "mongoose";

// Schema
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Allowed values
      set: (v) => v.toLowerCase(), // <== This handles case-insensitive input
    },
  },
  { timestamps: true }
);

//model
export const User = mongoose.model("User", userSchema);
