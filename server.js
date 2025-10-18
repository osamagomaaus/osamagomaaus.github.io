// ==================== server.js ====================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // MySQL connection using mysql2
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;
const JWT_SECRET = 'supersecretjwtkey123!@#';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ---------------- RATE LIMITER ----------------
const limiter = rateLimit({
  windowMs: 60*1000,
  max: 20,
  message: { success: false, message: 'Too many requests, try later' }
});
app.use(limiter);

// ---------------- VALIDATION ----------------
function validateEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePhone(phone){ return /^[0-9+]{7,15}$/.test(phone); }
function validatePassword(password){ return password.length >= 6; }
function validateFullname(name){ return name.length >=3; }

// ---------------- JWT Middleware ----------------
function authenticateJWT(req,res,next){
  const token = req.headers['authorization'];
  if(!token) return res.status(401).json({ success:false, message:'Token missing' });
  jwt.verify(token, JWT_SECRET, (err, decoded)=>{
    if(err) return res.status(403).json({ success:false, message:'Invalid token' });
    req.user = decoded;
    next();
  });
}

// ---------------- USER ROUTES ----------------
// Register or update user
app.post('/user', async (req,res)=>{
  try{
    const { fullname, phone, email, password } = req.body;
    if(!fullname||!phone||!email||!password)
      return res.json({ success:false, message:'All fields required' });
    if(!validateFullname(fullname)) return res.json({ success:false, message:'Fullname too short' });
    if(!validatePhone(phone)) return res.json({ success:false, message:'Invalid phone' });
    if(!validateEmail(email)) return res.json({ success:false, message:'Invalid email' });
    if(!validatePassword(password)) return res.json({ success:false, message:'Password too short' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [existingUser] = await db.promise().query('SELECT id FROM users WHERE email=?',[email]);
    if(existingUser.length>0){
      await db.promise().query('UPDATE users SET fullname=?, phone=?, password=? WHERE email=?',[fullname, phone, hashedPassword, email]);
      return res.json({ success:true, userId:existingUser[0].id });
    } else {
      const [result] = await db.promise().query('INSERT INTO users (fullname, phone, email, password) VALUES (?,?,?,?)',[fullname, phone, email, hashedPassword]);
      return res.json({ success:true, userId: result.insertId });
    }
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Database error' });
  }
});

// Login
app.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email||!password) return res.json({ success:false, message:'Email and password required' });

    const [rows] = await db.promise().query('SELECT * FROM users WHERE email=?',[email]);
    if(rows.length===0) return res.json({ success:false, message:'User not found' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.json({ success:false, message:'Incorrect password' });

    const token = jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn:'1h' });
    res.json({ success:true, user:{id:user.id, fullname:user.fullname, phone:user.phone, email:user.email}, token });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Database error' });
  }
});

// Get user info
app.get('/user/:email', async (req,res)=>{
  try{
    const email = req.params.email;
    const [rows] = await db.promise().query('SELECT id, fullname, phone, email FROM users WHERE email=?',[email]);
    if(rows.length===0) return res.json({ success:false, message:'User not found' });
    res.json({ success:true, user: rows[0] });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Database error' });
  }
});

// Get orders for user
app.get('/orders/:userId', authenticateJWT, async (req,res)=>{
  try{
    const userId = req.params.userId;
    if(req.user.id!=userId) return res.status(403).json({ success:false, message:'Forbidden' });
    const [orders] = await db.promise().query('SELECT * FROM orders WHERE user_id=?',[userId]);
    res.json({ success:true, orders });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Database error' });
  }
});

// Add order
app.post('/order', authenticateJWT, async (req,res)=>{
  try{
    const { totalAmount } = req.body;
    if(!totalAmount||totalAmount<=0) return res.json({ success:false, message:'Invalid amount' });
    const orderNumber = Math.floor(Math.random()*1000000);
    await db.promise().query('INSERT INTO orders (user_id, order_number, total_amount) VALUES (?,?,?)',[req.user.id, orderNumber, totalAmount]);
    res.json({ success:true, orderNumber });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Database error' });
  }
});

// Default
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));

// 404 & error
app.use((req,res)=>res.status(404).json({ success:false, message:'Endpoint not found' }));
app.use((err,req,res,next)=>{ console.error(err.stack); res.status(500).json({ success:false, message:'Server error' }); });

app.listen(PORT, ()=>console.log(`🚀 Server running on http://localhost:${PORT}`));
