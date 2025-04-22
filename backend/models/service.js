const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // رابط الأيقونة
  image: { type: String, required: true }, // رابط الصورة
});

module.exports = mongoose.model('Service', serviceSchema);