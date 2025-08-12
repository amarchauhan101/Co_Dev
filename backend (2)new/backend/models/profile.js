// const mongoose = require('mongoose');
// const express = require('express');

// const profileSchema = new mongoose.Schema({
//     bio: {
//         type: String
//     },
//     avatar: {
//         type: String,
//         default:''
//     },
//     skills: [
//         {
//             type: String
//         }
//     ],
//     experience: {
//         type: String
//     },
//     education: {
//         type: String
//     },
//     social: {
//         youtube: {
//             type: String
//         },
//         facebook: {
//             type: String
//         },
//         twitter: {
//             type: String
//         },
//         linkedin: {
//             type: String
//         },
//         instagram: {
//             type: String
//         },
//         github: {
//             type: String
//         }
//     },
//     projects:[{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Project'
//     }],
//     requests:[{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'ProjectRequest'
//     }],
//     points:{
//         type: Number,
//         default: 0
//     },
//     isactive:{
//         type: Boolean,
//         default: true
//     },
//     activeat:{
//         type: Date
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// })

// module.exports = mongoose.model('Profile', profileSchema);

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  bio: {
    type: String,
  },
  avatar: {
    type: String,
    default: '',
  },
  skills: [
    {
      type: String,
    },
  ],
  experience: {
    type: String,
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner',
  },
  interests: [
    {
      type: String, // e.g., 'Web Development', 'Open Source', 'AI/ML'
    },
  ],
  education: {
    type: String,
  },
  social: {
    youtube: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectRequest',
    },
  ],
  points: {
    type: Number,
    default: 0,
  },
  isactive: {
    type: Boolean,
    default: true,
  },
  activeat: {
    type: Date,
  },
  weeklyLogins: [Date],
  responseTimes: [Number], // in milliseconds
  taskCompletionRates: [Number], // e.g., 80 for 80%
  githubCommits: {
    type: Number,
    default: 0,
  },
  reliabilityScore: {
    type: Number,
    default: 0,
  },
  pointHistory: [
  {
    date: { type: Date, default: Date.now },
    points: Number,
    reason: String,
  }
],
reliabilityHistory: [
  {
    date: { type: Date, default: Date.now },
    score: Number,
    reason: String,
  },
],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
