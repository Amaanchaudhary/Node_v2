import http from 'http'
import fs from 'fs'
import url from 'url'

const server = http.createServer((req, res) => {
  const log = `${Date.now()}: ${req.url} New Request Recieve \n`
  const myUrl = url.parse(req.url, true)
  console.log(myUrl);

  if (req.url === "/favicon.ico") return res.end();

  fs.appendFile("log.txt", log, (err, data) => {
    switch (myUrl.pathname) {
      case "/": res.end("Homepage")
        break;
      case "/about":
        const qp = myUrl.query.myname
        res.end(`hi ${qp} wasssup`)
        break;
      case "/search":
        const search = myUrl.query.search_query
        res.end(`Here are your result for ${search}`)
        break;
      default: res.end("404 Not Found")
    }
  })
});

const port = 8000;

server.listen(port, () => console.log("server is running on port", port))
