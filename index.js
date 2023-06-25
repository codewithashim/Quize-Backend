// server.js
const express = require("express");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set up OpenAI API
const openaiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: openaiKey,
});
const openai = new OpenAIApi(configuration);
openai.apiKey = openaiKey;

// Set up MongoDB
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const quizeCollection = client.db("quize").collection("quize");


// Create a route for sending a topic to the chatbot
app.post("/api/v1/quiz", async (req, res) => {
  // Get the user's topic

  let data = req.body;
  const topic = req.body.topic;
  console.log("QUERY RECEIVED: " + topic);

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: topic,
    max_tokens: 4000,
  });

  var completionResponse = completion.data.choices[0].text;
  console.log(completionResponse);

  res.status(200);
  res.send(
    "<html><title>test</title><body>" + completionResponse + "</body></html>"
  );
});

// Send Data in database
app.post("/api/v1/quiz-save", async (req, res) => {
  //  get all data from request body
  let data = req.body;
  const topic = req.body.topic;

  //  save data in database

  const result = await quizeCollection.insertOne(data);

  res.status(200).json({
    status: "success",
    message: "Data saved successfully",
    data: result,
  })

});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
