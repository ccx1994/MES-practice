const express = require('express')
const http = require('http')
//const WebSocket = require('ws')


const app = express()
app.use(express.static('test'))

const server = http.createServer(app)
server.listen(8888)
//var fs = require('fs');//引入文件读取模块



//console.log(http);
//console.log(__dirname);

// var server = http.createServer(function (req, res) {
//     console.log("客户端连接");
//     var url = req.url;
//     var file = __dirname + url;
//     console.log(file);

//     fs.readFile(file, function (err, data) {
//         if(err){
//             res.writeHeader(404,{
//                 'content-type': 'text/html;charset="utf-8"'
//             })
//             res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
//             res.end();

//         }else{
//             res.writeHeader(200, {
//                 'content-type': 'text/html;charset="utf-8"'
//             })
    
//             res.write(data);
//             res.end();
//         }
        
//     })




// }).listen(8888);
const queryOffersObj = {};
const livePeerConnectionOffers = {};

var io = require('socket.io')(server);

io.on('connect',function(socket){
    console.log("服务器开启成功");
    
    
    //socket.emit('sendByServer',{info:"这是来自于服务端的信息"})

    socket.on('liveGroup',function(data){
        socket.join('liveGroup');
        livePeerConnectionOffers[socket.id] = data.liveOffer;
        queryOffersObj[data.index] = socket.id;
        console.log('收到直播房间号666发出的offer');
        console.log('已保存该offer，等待观众进入');
    })

    socket.on('watchGroup',function(data){
        socket.join('watchGroup');
        console.log('观众进入房间');
        io.sockets.in('watchGroup').emit('sendLiveOfferToWatch',livePeerConnectionOffers[queryOffersObj[data.room]]);
        console.log('已向该观众发送offer');
    })

    socket.on('sendWatchAnswerToLive',function(data){
        console.log('收到了观众发来的answer')
        console.log('将观众的answer发给房间666')
        io.sockets.in('liveGroup').emit('receiveAnswer',data.answer);
    })

    socket.on('ice_candidate_live',function(data){
        console.log('收到了主播发来的地址信息')
        io.sockets.in('watchGroup').emit('live_ice',data.ice);
        console.log('已将主播的地址信息发给观众')
    })

    socket.on('ice_candidate_watch',function(data){
        console.log('收到了观众发来的地址信息')
        io.sockets.in('liveGroup').emit('watch_ice',data.ice);
        console.log('已将观众的地址信息发给主播')
    })
})

