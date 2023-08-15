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
         jwt.sign({email,id: userDoc.id},secret,{},(err,token)=>{
                 if(err) throw err;
                 res.cookie('token',token).json('ok')
         })
       } else {
           return res.status(401).json({ message: 'Wrong credentials' });
       }
   } catch (error) {
       console.error('Login error:', error);
       return res.status(500).json({ message: 'An error occurred during login' });
   }
});

module.exports =router;



module.exports = router;