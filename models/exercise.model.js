const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId },
  description: { type: String },
  duration: { type: Number },
  date: { type: Date }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
