
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const { createParser } =  require('eventsource-parser');

const cors = require('cors');


// Init
const app = express();

const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new OpenAIApi(openaiConfig);

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


// Parse request bodies as JSON
app.use(bodyParser.json());
// app.use(limiter)
//app.use(cors());

// app.use('/', createProxyMiddleware({
//   target: 'https://api.openai.com',
//   changeOrigin: true,
//   onProxyReq: (proxyReq, req, res) => {
//     // 移除 'x-forwarded-for' 和 'x-real-ip' 头，以确保不传递原始客户端 IP 地址等信息
//     proxyReq.removeHeader('x-forwarded-for');
//     proxyReq.removeHeader('x-real-ip');
//   },
//   onProxyRes: function (proxyRes, req, res) {
//     proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//   }
// }));

app.post('/v1/chat/completions', async (req, res) => {
    try {
      const openaiRes = await openaiClient.createChatCompletion(req.body, { responseType: 'stream' });
      // console.log(openaiRes.data.choices[0]);
      // Response
      // res.send('Hello world!\n');
//       res.setHeader('Content-Type', 'application/json');
//          for await (const chunk of openaiRes.data) {
//               res.write(chunk);
//               res.end();
//         }  
       const resf = await fetch(`https://api.openai.com/v1/chat/completions`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            method: 'POST',
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: 'hello',
                temperature: 0.5,
                // max_tokens: 4096 - tokens,
                stream: true,
            }),
        }).catch((err) => {
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                }),
                { status: 500 },
            );
        });
        resf.pipe(res)
    } catch (error) {
      res.status(500).send(error.message);
    }
});
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const openaiRes = await openaiClient.createImage(req.body);
        res.send(openaiRes)
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
