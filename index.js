import express from 'express';
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { createParser } from 'eventsource-parser';
import { PassThrough } from 'stream';
import { OpenAI } from 'openai-streams/node';
import cors from 'cors';
import http from 'http';

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
        const options = {
          hostname: 'api.openai.com',
          port: 443,
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`  
          }
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          console.error(err);
          res.statusCode = 500;
          res.end('Internal Server Error');
        });

        req.pipe(proxyReq);
      
      //res.send('hello')
//       const stream = await OpenAI(
//         "completions",
//         {
//           model: "text-davinci-003",
//           prompt: "Write a happy sentence.\n\n",
//           max_tokens: 25
//         }
//       );

//   stream.pipe(res);
//       const openaiRes = await openaiClient.createChatCompletion(req.body, { responseType: 'stream' });
//       const stream = new PassThrough();
//       res.set({
//         'Connection': 'keep-alive',
//         'Cache-Control': 'no-cache',
//         'Content-Type': 'text/event-stream',
//       });

//       res.status(200);
//       stream.pipe(res);  
      //const writable = new require('stream').Writable();
//       openaiRes.data.on('data', (data) => {
//         //console.log(data.toString());
//         //res.send(data);
//           try {
//              // 对每次推送的数据进行格式化, 得到的是 JSON 字符串、或者 [DONE] 表示流结束
//              const message = data
//               .toString()
//               .trim()
//               .replace(/^data: /, '');
//               console.log(message);
//             // 流结束
//             if (message === '[DONE]') {
//               stream.write('data: [DONE]\n\n');
//               return;
//             }

// //             解析数据
//             const parsed = JSON.parse(message);

//             // 写入流
//             stream.write(`data: ${parsed || ''}\n\n`);
//           } catch (e) {
//             // 出现错误, 结束流
//             stream.write('data: [DONE]\n\n');
//           }
     // }); 
    } catch (error) {
      res.status(500).send(error.message);
    }
});
app.post('/v1/images/generations', async (req, res) => {
  console.log(req);
    try {
        const openaiRes = await openaiClient.createImage(req.body);
        //res.send(openaiRes.data);
        res.send(openaiRes);
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
