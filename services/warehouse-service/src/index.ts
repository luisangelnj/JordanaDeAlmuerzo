import http from "http";

const PORT = 3003
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Warehouse service corriendo y actualizado!");
});

server.listen(PORT, () => {
  console.log(`Warehouse service on port ${PORT}`);
});
