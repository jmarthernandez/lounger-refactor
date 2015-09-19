var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var io = require('socket.io')();

//mongo stuffs
var Promise = require('bluebird');
var mongoose = require('mongoose');
var mongoose = Promise.promisifyAll(mongoose);

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
  

  //initialize room
  Room.findOne({ name: 'lobby'})
    .then(function (lobby) {
      if(lobby) {
        return lobby
      }else {
        return Room.create({ name: 'lobby'})
      }
    })
    .then(function (roomData) {
      socket.join('lobby');
      socket.room = 'lobby';
      io.sockets.in(socket.room).emit('pastMessages', roomData.messages)      
    })

  socket.on('sendRooms', function(){
    Room.find()
      .then(function (rooms) {
        io.emit('sendingRooms', rooms)
      })
  })

  //change room if exists or create room
  socket.on('changeRoom', function(newroom){
    socket.leave(socket.room);
    socket.join(newroom.name);
    socket.room = newroom.name;
    // pass messages back
    Room.findOne({name: socket.room})
      .then(function (room) {
        if(room) {
          //go to second then
          return room
        } else {
          return Room.create({'name': socket.room})
        }
      })
      .then(function(roomData) {
        io.sockets.in(socket.room).emit('pastMessages', roomData.messages)
      })
  });

  // Add new messages to model
  socket.on('newMessage', function (message) {
    Room.findOne({name: socket.room})
      .then(function (room) {
        room.messages.push(message)
        return room.save
      })
      .then(function(room) {
        io.sockets.in(socket.room).emit('pastMessages', room.messages)
      })
  });

  // Video 
  socket.on('initiate', function (data) {
    io.sockets.in(socket.room).emit('startVid');

  });

  socket.on('paused', function (data) {
    io.sockets.in(socket.room).emit('pauseVid');
  });

  socket.on('changingUrl', function (url, error) {
    io.sockets.in(socket.room).emit('changeVid', url);
  });


});

var server = app.listen(3000)
console.log('listening on 3000')