const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express();
const PORT = 3000;

// app.use(express.json());

app.get('/healthy', async (req, res) => {
    res.send("Gateway Service is Healthy and Client")
    console.log("Gateway Service is Healthy");
})

app.use('/auth', createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { '^/auth': '' }
}))

app.use('/note', createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { '^/notes': '' }
}))



app.listen(PORT, () => {
    console.log(`Gateway Service is up and Running on PORT: ${PORT}`);
})