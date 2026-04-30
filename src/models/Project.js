const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  title:              { type: String, required: true },
  slug:               { type: String, required: true, unique: true },
  category:           { type: String, required: true },
  location:           { type: String, required: true },
  year:               { type: String, required: true },
  status:             { type: String, required: true },
  headingDescription: { type: String, required: true },
  bodyParagraphs:     { type: [String], required: true },
  bodyDescriptionTwo: { type: [String], default: null },
  images:             { type: [String], required: true },
  featured:           { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
