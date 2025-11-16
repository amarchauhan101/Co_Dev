const express = require('express');
const {generateResponse} = require("../services/gemini")

exports.generate = async (req, res) => {
  try {
    const { prompt } = req.query;
    const airesponse = await generateResponse(prompt);
    res.status(200).json({ airesponse });
  } catch (err) {
    console.error(" err in ai controller=>",err);
    res.status(500).send("Server Error");
  }
};
