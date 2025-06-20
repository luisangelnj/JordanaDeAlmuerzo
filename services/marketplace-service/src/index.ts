import http from 'http'

const PORT = 3004
const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Marketplace service running!')
})

server.listen(PORT, () => {
  console.log(`Marketplace service on port ${PORT}`)
})
