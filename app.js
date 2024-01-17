const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/job-portal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Create a mongoose schema
const jobSchema = new mongoose.Schema({
  positionName: String,
  companyName: String,
  jobPipeline: String,
  location: String,
  contractDetails: String,
  minSalary: String,
  maxSalary: String,
  currency: String,
  frequency: String,
  skillsRequired: String, // Add more fields as needed
  internResponsibilities: String,
  skillsCheck: String,
  qualification: String,
  finalizedQuestions: String,
  availability: String,
});

// Create a mongoose model
const Job = mongoose.model("Job", jobSchema);

// Define routes
app.get("/", (req, res) => {
  res.render("dashboard");
});

app.get("/job-form/step1", (req, res) => {
  res.render("job-form-step1");
});

app.post("/job-form/step1", async (req, res) => {
  try {
    // Create a new job instance
    const newJob = new Job({
      positionName: req.body.positionName,
      companyName: req.body.companyName,
      jobPipeline: req.body.jobPipeline,
      location: req.body.location,
      contractDetails: req.body.contractDetails,
      minSalary: req.body.minSalary,
      maxSalary: req.body.maxSalary,
      currency: req.body.currency,
      frequency: req.body.frequency,
    });

    // Save the job to the database
    await newJob.save();

    // Render the next step of the form
    res.render("job-form-step1", { jobId: newJob._id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/job-form/step2", async (req, res) => {
  try {
    // Retrieve data from the form
    const { skillsRequired, internResponsibilities, jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).send("Job not found");
    }

    // Update the job instance with the new data
    job.skillsRequired = skillsRequired;
    job.internResponsibilities = internResponsibilities;

    // Save the updated job to MongoDB
    await job.save();

    // Render the next step or perform other actions
    res.render("job-form-step2", { jobId });
    console.log("Received data in /job-form/step2:", req.body);
    console.log("Job ID in /job-form/step2:", jobId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/job-form/step3", async (req, res) => {
  try {
    // Retrieve data from the form
    const {
      skillsCheck,
      qualification,
      finalizedQuestions,
      availability,
      jobId,
    } = req.body;

    // Assuming you have the Job model defined earlier
    // Retrieve the job document from MongoDB
    const job = await Job.findById(jobId);
    if (!job) {
      console.error("Job not found for ID:", jobId);
      return res.status(404).send("Job not found");
    }

    // Update the job instance with the new data for step 3
    job.skillsCheck = skillsCheck;
    job.qualification = qualification;
    job.finalizedQuestions = finalizedQuestions;
    job.availability = availability;

    // Save the updated job to MongoDB
    await job.save();

    // Render any additional steps or perform other actions

    console.log("Job saved successfully");
    console.log("Received data in /job-form/step3:", req.body);
    console.log("Job ID in /job-form/step3:", jobId);
    res.render("job-form-step2", { jobId, submitted: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
