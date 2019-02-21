process.on('SIGINT', function () {
  process.exit()
})

const express = require('express')
const bodyParser = require("body-parser")
const imageInterface = require('image-data-uri')
const datapay = require('datapay')
const http = require('request')
const server = express()
const fs = require('fs')
const os = require('os')

const inDocker = (process.env.DOCKERIZED ? true : false)
const port = (process.env.IN_PORT ? process.env.IN_PORT : 8080)

// Your Bitcoin SV Private Key (use a throwaway address for security)
var privateKey = process.env.BSV_PK;
var nodeuser = process.env.NODE_RPC_USER;
var nodepass = process.env.NODE_RPC_PASS;

if (!privateKey || privateKey.length < 52 || !nodeuser || !nodepass) {
  console.log('Usage:')
  if (inDocker) {
    console.log('docker run -d \\')
    console.log(' -p 8080:8080 \\')
    console.log(' -e BSV_PK=Your Bitcoin SV Private Key (use a throwaway address for security) \\')
    console.log(' -e NODE_RPC_USER=username for your RPC node endpoint) \\')
    console.log(' -e NODE_RPC_PASS=password for your RPC node endpoint) \\')
    console.log(' breign/image2chain:latest')
  } else {
    console.log('set BSV_PK=Your Bitcoin SV Private Key (use a throwaway address for security)')
    console.log('node index.js')
  }
  process.exit(0)

};

server.use(bodyParser.urlencoded({ extended: false }));
server.get('/health', (request, response) => {

  datapay.connect('https://bchsvexplorer.com').getUnspentUtxos("3M6d11CXeHobNQXptbiNeTAMm2TDuKsADr", function (err, utxos) {
    if (err) {
      response.send("Error: ", err)
    } else {
      response.send(utxos)
    }
  });
  // response.send('Healthy')
})

server.get('/', (request, response) => {
  console.log(new Date().toISOString() + ' ' + request.query.url)
  if (!request.query.url) {
    response.send("Missing ?url=, or Make a POST request and populate data64 with Base64 encoded image/png bytes")
    return
  }
  //@TODO
  //we got url, let's try to check if that really is image, download, validate, transcode and store to blockchain
  //warning, on opened net, someone could forge url.
  imageInterface.encodeFromURL(request.query.url).then(function (imgres) {
    console.log(imgres)
    //make datapay

    response.send('TODO')
  })

})

//if we got POST, then it already should be base64 png image, TODO check if it really is
server.post('/', (request, response) => {
  console.log(new Date().toISOString() + ' ' + request.body.data64)
  if (!request.body.data64) {
    response.send('Missing POST data64')
    return
  }
  //@TODO decode & save data64 to /tmpm check if is really image...
  var img = request.body.data64
  //let buff = Buffer.from(imgres, 'base64');
  //   imageInterface.encodeFromFile('./breign.png').then(function(imgb64) {
  xdata = fs.readFileSync('E:\\Benjo\\Pictures\\my art\\engage.jpg') //, {encoding: 'utf-8'}, function(err,xdata){
  //...it's real image, here are encoded bytes, make datapay

  const tx = {
    data: ["19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut", toArrayBuffer(xdata), 'image/jpeg'],
    pay: {
      key: privateKey,
      /*      rpc: "https://" + nodeuser + ":" + nodepass + "@bsv.skylab.si" */
    }
  }
  datapay.build(tx, function (err, res) {
    if (err) {
      console.log("Error:", err.toString())
      response.send({ error: err })
    } else {

      var txid = new Date().toISOString().replace(/\-/g, '').replace(/\:/g, '').replace(/\./g, '');
      fs.writeFileSync(os.tmpdir() + '/' + txid + '.tx', '{"jsonrpc": "1.0", "id":"' + txid + '", "method": "sendrawtransaction", "params": ["' + res.toString() + '"] }')
      //we have tx now, let's send it to our node
      // response.send(res.toString())
      // process.exit()

      http.post({
        url: 'https://bsv.skylab.si/',
        auth: { user: nodeuser, password: nodepass },
        json: { jsonrpc: "1.0", id: txid, method: "sendrawtransaction", "params": [res.toString()] },
        // json: { jsonrpc: "1.0", id: txid, method: "validateaddress", "params": ["3M6d11CXeHobNQXptbiNeTAMm2TDuKsADr"] },
      },
        function (http_error, http_response, http_body) {
          if (!http_error && http_response.statusCode == 200) {
            response.send(http_body)
          } else {
            console.log(http_error)
            response.send(http_error, http_response)
          }
        }

      )
      /*
                response.send(
                  {
                    error:null,
                    v: 3,
                    q: {
                      find: {tx: {h:res}},
                      limit: 1
                  }
                  })
      */
    }
  })

})

// })

server.listen(port, (err) => {
  if (err) {
    return console.log('Error', err)
  }
  console.log(new Date().toISOString() + ' ' + `Server is listening on ${port}`)
})

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}
function toBuffer(ab) {
  var buf = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}