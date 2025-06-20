import http from "http";

const PORT = 3001
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Manager service running!");
});

server.listen(PORT, () => {
  console.log(`Manager service running on port ${PORT}`);
});
