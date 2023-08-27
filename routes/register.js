const express = require('express');
const router = express.Router();
const cors = require('cors');
const User = require('../models/user')
const app = express();
app.use(express.json());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret='18ef1ae82268e75f0fe4bad8ff2eb167f96d803144fe07ce91bb8a5b243d665792275c7eec7460c3f9144612667f9886281d6ab5154d92cf98984ff9d2148a70'
const cookieParser =require('cookie-parser')
const salt = bcrypt.genSaltSync(10);


app.use(cookieParser());
app.use(express.json());
app.use(cors());


function verifyToken(req, res, next) {
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      req.user = decoded;
      next();
    });
  }
  
  
  

router.options('/', cors());
router.post('/',async(req,res)=>{
    const {email, password}= req.body;
    
   try {
    const userDoc= await User.create({
      email,
      password:bcrypt.hashSync(password,salt)
    })
    
    
    res.json(userDoc)
   } catch (error) {
    res.status(400).json(error)
   }
   
   
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userDoc = await User.findOne({ email });
  
      if (!userDoc) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const acceptedPass = bcrypt.compareSync(password, userDoc.password);
  
      if (acceptedPass) {
        const token = jwt.sign({ email, id: userDoc.id }, secret, {});
        res.cookie('token', token).json({ token }); // Send the token to the frontend
      } else {
        return res.status(401).json({ message: 'Wrong credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'An error occurred during login' });
    }
  });
 app.use('/admin-panel', verifyToken, (req, res, next) => {
   // If the token is valid, call the next middleware or route handler
  // If the token is not valid or missing, handle it accordingly
   next(); // Continue to the next middleware or route handler
 }, /* other middleware */ (req, res) => {
   // Your route handler logic here
 //   // This is where you can perform actions for the /admin-panel route
  // For example, send a JSON response indicating successful access
   res.status(200).json({ message: 'Authenticated user accessing admin panel' });
});
  router.get('/check-login', verifyToken, (req, res) => {
    // If the middleware passes, the user is authenticated
    res.status(200).json({ loggedIn: true });
  });

module.exports =router;



