const express = require('express')
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const app = express()
app.use(express.json())

const port = 9000

app.get('/', (req, res) => {
  res.send('欢迎来到我的网站！');
});

app.post('/message', (req, res) => {
  console.log(req.body.message);
  res.send('Message received!');
});

app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
//   onProxyReq: (proxyReq, req, res) => {
//     // 移除 'x-forwarded-for' 和 'x-real-ip' 头，以确保不传递原始客户端 IP 地址等信息
//     console.log('openai:req')
//     proxyReq.removeHeader('x-forwarded-for');
//     proxyReq.removeHeader('x-real-ip');
//   },
  onProxyRes: function (proxyRes, req, res) {
    console.log('openai:res')
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
