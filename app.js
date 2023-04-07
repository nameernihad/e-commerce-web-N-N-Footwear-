const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://NihadNameer:nameernihad@cluster0.ngmhckj.mongodb.net/nn")
require('dotenv').config();
const nocache = require('nocache');
const express = require("express");
const bodyParser  = require('body-parser');

const twilioRouter = require('./routes/userRoute');
const app =express();
const path =require('path');



app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public")));

const { PORT } = process.env;
const port = 8080 || PORT;
const jsonParser = bodyParser.json();


app.use(jsonParser);
app.use('/twilio-sms', twilioRouter);
// for user route
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

// for  admin route
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.use(nocache());

app.use(express.static(path.join(__dirname,'public')))


app.listen(port,()=>{
    console.log(`server is running....${PORT}`);
});


