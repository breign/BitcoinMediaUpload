process.on('SIGINT', function() {
    process.exit()
})
  
  const express = require('express')
  const bodyParser = require("body-parser");
  const imageInterface = require('image-data-uri')
  const server = express()
  const inDocker = (process.env.DOCKERIZED?true:false)
  const port = (process.env.IN_PORT?process.env.IN_PORT:8080)
  
  // Your Bitcoin SV Private Key (use a throwaway address for security)
  var privateKey = process.env.BSV_PK;
  
  if (!privateKey) {
    console.log('Usage:')
    if (inDocker) {
      console.log('docker run -d \\')
      console.log(' -p 8080:8080 \\')
      console.log(' -e BSV_PK=Your Bitcoin SV Private Key (use a throwaway address for security) \\')
      console.log(' breign/image2chain:latest')
    } else {
      console.log('set BSV_PK=Your Bitcoin SV Private Key (use a throwaway address for security)')
      console.log('node index.js')
    }
    process.exit(0)

  };
  
  server.use(bodyParser.urlencoded({ extended: false }));
  server.get('/health', (request, response) => {
    response.send('Healthy')
  })

  server.get('/', (request, response) => {
    console.log(new Date().toISOString()+' '+request.query.url)
    if (!request.query.url) {
      response.send("Missing ?url=, or Make a POST request and populate data64 with Base64 encoded image/png bytes")
      return
    }
    //@TODO
    //we got url, let's try to check if that really is image, download, validate, transcode and store to blockchain
    //warning, on opened net, someone could forge url.

  })
  
  //if we got POST, then it already should be base64 png image, TODO check if it really is
  server.post('/', (request, response) => {
    console.log(new Date().toISOString()+' '+request.body.data64)
    if (!request.body.data64) {
      response.send('Missing POST data64')
      return
    }
    //@TODO
  //  imageInterface.encodeFromFile('./icon.png').then(function(res) {
      console.log(res)
      /*
      datapay.send({
        data: ["", res]
      }, function(err, tx) {
        console.log(err, tx)
      })
      */
  //  })
    
    /*
    const tx = {
      data: ["0x6d02", request.query.input],
      pay: { key: privateKey }
    }
    var ret = ""
    datapay.send(tx, function(err, res) {
      if (err) {
        console.log("Error:",err)
        response.send({error:err})
      }
      if (res) {
        console.log("OK:",res)
        response.send(
          {
            error:null,
            v: 3,
            q: {
              find: {tx: {h:res}},
              limit: 1
          }
          })
  
      }
    })
    */

  })
  
  server.listen(port, (err) => {
    if (err) {
      return console.log('Error', err)
    }
    console.log(new Date().toISOString()+' '+`Server is listening on ${port}`)
  })