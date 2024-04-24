import http from 'http'
import pkg from 'http-proxy'
const { createProxyServer } = pkg;

//proxy server
const proxy = createProxyServer();

//List of server to load balance between 
const servers = [
    { host: "localhost", port: 3000 },
    { host: "localhost", port: 3001 },
]

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
    console.log('Connection error in:', req.url);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error...');
});

//Listen the incoming request
const PORT = process.env.PORT || 8000
loadbalancer.listen(PORT, () => {
    console.log(`Load Balancer running on port ${PORT}`)
})