let express = require('express');
let app = express();
app.listen(8001,()=>
    console.log('listening to port:8001...')
)

app.use(express.static('public'));
let path = require('path')
app.use('/build/',express.static(path.join('C:/Users/zixua/OneDrive/Codings/three.js-master/three.js-master','/build')));
app.use('/jsm/', express.static(path.join('C:/Users/zixua/OneDrive/Codings/three.js-master/three.js-master', '/examples/jsm')));
console.log('server is ready.'); //如果要用反斜杠，就打两次
console.log('localhost:8001\n10.192.54.102:8001')


let fs = require('fs');//node 的一个package


app.get('/refresh',sendJSON)
function sendJSON(request,response){
    let data = fs.readFileSync('points.json') //载入一个json文件
    let pointvalues = JSON.parse(data)
    response.send(pointvalues)
}

app.get('/refresh2',sendJSON2)
function sendJSON2(request,response){
    let data = fs.readFileSync('buildings.json') //载入一个json文件
    let buildingvalues = JSON.parse(data)
    response.send(buildingvalues)
}