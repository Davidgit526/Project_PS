const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/job_portal', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Define a schema for job seekers
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

// Create a model from the schema
const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

// Create Express application
const app = express();

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Route to handle job seeker registration form submission
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
      // Construct HTML response to display success message in the middle
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

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
