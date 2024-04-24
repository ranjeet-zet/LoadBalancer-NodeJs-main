import http from 'http'
import pkg from 'http-proxy'
import dotenv from "dotenv"
const { createProxyServer } = pkg;
import serversConfig from './configration.js';
dotenv.config({
    path: './.env'
})
//proxy server
const proxy = createProxyServer();

//List of server to load balance between 
const servers = serversConfig;

// create the load balancer
const loadbalancer = http.createServer((req, res) => {
    //Pick a server to forward the request to
    const server = servers[Math.floor(Math.random() * servers.length)];
    //Proxy to the server to selected server

    // Proxy to the selected server
    proxy.web(req, res, { target: `http://${server.host}:${server.port}` });
})

// Global error handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

// Listen for proxy errors
proxy.on('error', (err, req, res) => {
    console.log('Connection error in:', {port:err.errors[1].port,
        address:err.errors[1].address,
        path:req.url,
    });
    // host:'http://'+err.errors[1].address+":"+err.errors[1].port+req.url
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('Internal Server Error...');
});

//Listen the incoming request
const PORT = process.env.PORT || 8000
loadbalancer.listen(PORT, () => {
    console.log(`Load Balancer running on port ${PORT}`)
})