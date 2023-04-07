
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
const rateLimit = require('express-rate-limit');
const cors = require('cors');


// Init
const app = express();

const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new OpenAIApi(openaiConfig);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


// Parse request bodies as JSON
app.use(bodyParser.json());
app.use(limiter)
app.use(cors());

app.post('/v1/chat/completions', async (req, res) => {
    try {
      console.log(res.body)
      const openaiRes = await openaiClient.createChatCompletion(res.body);
      // console.log(openaiRes.data.choices[0]);
      // Response
      // res.send('Hello world!\n');
      res.setHeader('Content-Type', 'application/json');
      res.send(response);
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.post('/prompt', async (req, res) => {

  const promptParams = req.body;
  // console.log(promptParams);

  const data = {
    'model': "text-davinci-003",
    'prompt': promptParams.prompt || 'Hello world!',
    'temperature': promptParams.temperature || 0.7,
    'max_tokens': promptParams.max_tokens || 2000,
    'top_p': 1,
    'frequency_penalty': 0,
    'presence_penalty': 0
  };
  // console.log(data);


  try {
    const openaiRes = await openaiClient.createCompletion(data);
    // console.log(openaiRes.data.choices[0]);

    // Response
    // res.send('Hello world!\n');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(openaiRes.data.choices[0]));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching the answer.' });
  }
});
const port = 9000;
// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
