import http from "http";

const PORT = 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Kitchen service running!");
});

server.listen(PORT, () => {
  console.log(`Kitchen service on port ${PORT}`);
});
