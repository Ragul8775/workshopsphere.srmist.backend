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
  origin: 'https://workshopsphere-srmist.vercel.app', // Allow requests from this origin
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
app.use('/admin', registerRouter)
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

app.put('/admin/projects/:id', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content } = req.body;

    const updatedFields = {
      title,
      summary,
      content,
    };

    if (req.file) {
      const { originalname, path: filePath } = req.file;
      const ext = path.extname(originalname);
      const newPath = path.join(path.dirname(filePath), path.basename(filePath, ext) + ext);

      // Rename the uploaded file
      await fs.promises.rename(filePath, newPath);

      updatedFields.cover = newPath;
    }

    // Update the project document
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true } // Returns the updated document
    );

    res.json(updatedProject);
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
app.get('/projects/:id', async(req,res)=>{
  const {id}= req.params;
  const postDoc = await Project.findById(id);
  res.json(postDoc);
})

app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the project by ID
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete the cover image file associated with the project
    if (deletedProject.cover) {
      await fs.promises.unlink(deletedProject.cover);
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
