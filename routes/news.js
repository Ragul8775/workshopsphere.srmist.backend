const express = require('express');

const router = express.Router();
const News = require('../models/news');  // Import your News model




router.post('/',async(req,res)=>{
  try {
    const {title, summary, isImportant} = req.body;
    console.log(title,summary)
    const NewsDocument = await News.create({
      title,
      summary,
      isImportant,
    });
    res.json(NewsDocument);
  } catch (error) {
   

    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
 
);

router.get('/', async(req,res)=>{
  res.json(await News.find().sort({ createdAt: -1 }).limit(20));
})

module.exports = router;
