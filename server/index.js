var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var io = require('socket.io')();

//mongo stuffs
mongoose = require('mongoose');

//parse out request bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//MONOLITH TIME
Schema = mongoose.Schema;
var roomSchema = mongoose.Schema({
  name: {
    type: String,
    default: ''     
  },
  messages: [],
  created: {
    type: Date,
    default: Date.now
  }
});

var Room = mongoose.model('Room', roomSchema)
mongoose.connect('mongodb://localhost/lounger');

var Room = mongoose.model('Room')

// socket stuff
io.on('connection', function (socket) {

  var Room = mongoose.model('Room')
  var Rooms =[];
  
  Room.findOne({ name: 'lobby'}, function(err, data){
    if (data === null){
      Room.create({ name: 'lobby'}, function (err, data) {
        if (err) {
          return console.error(err);
        }
        socket.join('lobby');
        socket.room = 'lobby'

        io.sockets.in(socket.room).emit('pastMessages', data.messages)
      });
    }else{
      socket.join('lobby');
      socket.room = 'lobby'

      io.sockets.in(socket.room).emit('pastMessages', data.messages)
    }
  })


});

var server = app.listen(3000)
console.log('listening on 3000')