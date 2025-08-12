const mongoose = require('mongoose');
const express = require("express")
require("dotenv").config()
exports.connection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true     
    }).then(()=>{
        console.log('Connected to MongoDB');
    }).catch(err=>{
        console.error('Error connecting to MongoDB',err);
        process.exit(1);
    })
}