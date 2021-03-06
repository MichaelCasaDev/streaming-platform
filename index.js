/* ########################## */
// Config
/* ########################## */
let streams = []
let allowedStreams = ["test"]
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};


/* ########################## */
// Stream Server
/* ########################## */
const NodeMediaServer = require('node-media-server');
var nms = new NodeMediaServer(config)
nms.run();

nms.on('prePublish', (id, StreamPath, args) => {
  if(allowedStreams.includes(StreamPath.replace('/live/', ''))) {
    streams.push({
      name: StreamPath.replace('/live/', ''),
      link: StreamPath.replace('/live/', '/stream/')
    })
  } else {
    nms.getSession(id).reject()
  }
});

nms.on('donePublish', (id, StreamPath, args) => {
  streams.shift({
    name: StreamPath.replace('/live/', ''),
    link: StreamPath
  })
});


/* ########################## */
// Web Server
/* ########################## */
const express = require('express')
const app = express()

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + "/views");
app.use(express.json());
app.use(express.urlencoded({extended: true})); 


app.get("/", (req, res) => {
  res.render('index.ejs', {streams: streams })
})


app.get("/stream/:id", (req, res) => {
  res.render('stream.ejs', {id: req.params.id})
})

app.all("*", (req, res) => {
  res.send({
    message: "Nothing here..."
  })
})


app.listen(3000, () => {
  console.log("Web server started on port 3000")
})