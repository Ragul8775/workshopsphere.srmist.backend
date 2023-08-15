const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  isImportant:{
      type:Boolean,
      required:true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const News = mongoose.model('News', newsSchema);

module.exports = News