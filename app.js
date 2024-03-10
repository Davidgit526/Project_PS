// app.js

const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/job_portal', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

const jobSeekerSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, index: true },
  phoneNumber: String,
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  currentJobTitle: String,
  industry: String,
  experienceYears: Number,
  educationLevel: String,
  expectedSalary: String
}, { autoIndex: false });

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/register', (req, res) => {
  const newJobSeeker = new JobSeeker({
    fullName: req.body.fullName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    country: req.body.country,
    currentJobTitle: req.body.currentJobTitle,
    industry: req.body.industry,
    experienceYears: req.body.experienceYears,
    educationLevel: req.body.educationLevel,
    expectedSalary: req.body.expectedSalary
  });

  newJobSeeker.save()
    .then(savedJobSeeker => {
      console.log('Job seeker registered successfully:', savedJobSeeker);
      const successMessage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Success</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .success-message {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="success-message">
            <h1>Job seeker registered successfully</h1>
            <p>${savedJobSeeker.fullName} has been added.</p>
            <a href="/details/${savedJobSeeker._id}"><button>View Details</button></a>
          </div>
        </body>
        </html>
      `;
      res.send(successMessage);
    })
    .catch(err => {
      console.error('Error inserting data into MongoDB: ', err);
      res.status(500).send('An error occurred while registering job seeker: ' + err.message);
    });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/details/:id', (req, res) => {
  const jobId = req.params.id;
  JobSeeker.findById(jobId)
    .then(job => {
      if (!job) {
        res.status(404).send('Job seeker not found');
        return;
      }
      res.send(`
        <h1>Job Seeker Details</h1>
        <ul>
          <li>Full Name: ${job.fullName}</li>
          <li>Email: ${job.email}</li>
          <li>Phone Number: ${job.phoneNumber}</li>
          <li>Street: ${job.street}</li>
          <li>City: ${job.city}</li>
          <li>State: ${job.state}</li>
          <li>Zip: ${job.zip}</li>
          <li>Country: ${job.country}</li>
          <li>Current Job Title: ${job.currentJobTitle}</li>
          <li>Industry: ${job.industry}</li>
          <li>Years of Experience: ${job.experienceYears}</li>
          <li>Highest Education Level: ${job.educationLevel}</li>
          <li>Expected Salary: ${job.expectedSalary}</li>
        </ul>
      `);
    })
    .catch(err => {
      console.error('Error retrieving job seeker details: ', err);
      res.status(500).send('An error occurred while retrieving job seeker details: ' + err.message);
    });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
