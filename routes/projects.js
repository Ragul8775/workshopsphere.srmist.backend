const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({dest:'uploads/'})
const path = require('path');
const Project = require('../models/projects');
const fs = require ('fs')

// Multer setup for image uploads

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



router.post('/', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path: filePath } = req.file; // Renamed to filePath
  const ext = path.extname(originalname);
  const newPath = path.join(path.dirname(filePath), path.basename(filePath, ext) + ext);

  try {
    await fs.promises.rename(filePath, newPath);

    const { title, summary, content } = req.body;
    const projectDocument = await Project.create({
      title,
      summary,
      content,
      cover: newPath,
    });

    res.json(projectDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/',async (req,res)=>{
  
  res.json(await Project.find().sort({createdAt :-1}).limit(20));
})

module.exports = router;


