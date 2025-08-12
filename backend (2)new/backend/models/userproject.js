// models/UserProject.js
const express = require('express');
const mongoose = require('mongoose');

const userProjectSchema = new mongoose.Schema({
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    
});

module.exports = mongoose.model('UserProject', userProjectSchema);