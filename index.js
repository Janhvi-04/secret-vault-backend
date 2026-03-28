const authRoutes=require('./routes/auth');
const secretRoutes=require('./routes/secrets')
const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const { default: mongoose } = require('mongoose');
dotenv.config();
const app=express();
const PORT=process.env.PORT || 5000;
app.use(cors({
    origin: "https://secret-vault-frontend-one.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/secrets',secretRoutes)
mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("MongoDB connected successfully"))
    .catch((err)=>console.log("MongoDB connection error: ",err))
app.get('/',(req,res)=>{
    res.send('Seret Vault Backend is Running! ');
});
app.listen(PORT,()=>{
    console.log(`Server is locked and loaded on port ${PORT}`);
})