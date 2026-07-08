require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');

const express=require('express');
const app=express();

const connectDB=require('./db/connect');
const authRouter=require('./routes/authRoute');
const urlRouter=require('./routes/urlRoute');

require('./cron/deleteInactiveURL');

const notFound=require('./middleware/notFoundMiddleware');
const errorHandler=require('./middleware/errorHandlerMiddleware');


app.use(helmet());
app.use(cors());
// app.use(
//     rateLimiter({
//         windowMs:15*60*1000,
//         max:100,
//         message:'Too many requests from this IP'
//     })
// );

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/auth',authRouter);
app.use('/shorten',urlRouter);

app.use(notFound)
app.use(errorHandler)

const port=process.env.PORT || 5000
const start=async ()=>{
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port,()=>{
            console.log('Server is running....');  
        })
    }
    catch(error){
        console.log(error);
    }
    

}

start();
