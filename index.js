const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); 
const registerRouter = require('./routes/register');
const NewsRouter = require('./routes/news')

dotenv.config();

// Other required modules
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const path = require('path');
const Project = require('./models/projects');
const fs = require('fs');


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(reqLogger); // Logging middleware
// Configuring CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true, // Allow cookies and authentication headers to be sent
};
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger middleware
function reqLogger(req, res, next) {
  console.log(`${req.method}: ${req.url}`);
  next();
}

// Register route
app.use('/admin/register', registerRouter);
app.use('/admin', registerRouter);
app.use('/admin/news',NewsRouter)

// Post request for projects
app.post('/admin/projects', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path: filePath } = req.file; // Renamed to filePath
  const ext = path.extname(originalname);
  const newPath = path.join(path.dirname(filePath), path.basename(filePath, ext) + ext);

  try {
    // Rename the uploaded file
    await fs.promises.rename(filePath, newPath);

    const { title, summary, content } = req.body;
    // Create a project document
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

// GET request for project folder
app.get('/admin/projects', async (req, res) => {
  // Fetch and return projects
  res.json(await Project.find().sort({ createdAt: -1 }).limit(20));
});
app.get('/admin/projects/:id', async(req,res)=>{
  const {id}= req.params;
  const postDoc = await Project.findById(id);
  res.json(postDoc);
})
const PORT =  6001;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));