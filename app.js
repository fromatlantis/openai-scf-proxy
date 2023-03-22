const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()

app.get('/hello', (req, res) => {
  res.send('欢迎来到我的网站！');
});

// app.use('/', createProxyMiddleware({
//   target: 'https://api.openai.com',
//   changeOrigin: true,
//   onProxyRes: function (proxyRes, req, res) {
//     proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//   }
// }));

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
