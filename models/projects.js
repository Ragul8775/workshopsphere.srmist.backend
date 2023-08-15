const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:String,
  summary:String,
  content:String,
  cover:String,
},{
  timestamps:true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;