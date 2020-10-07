const express = require('express')
const bodyParser = require('body-parser')
const usersRouter = require('./src/routes/users')
const env = require('./src/helpers/env')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')
const usersModel = require('./src/models/users')
const db = require('./src/configs/db')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


io.on('connection', (socket) => {
  console.log('user connected!')

  socket.on('get-all-users', () => {
    usersModel.getAll()
    .then((result) => {
      // console.log(result)
      io.emit('list-users', result)
    }).catch((err) => {
      console.log(err)
    });
  })
  socket.on('join-room', (payload) => {
    socket.join(payload)
  }),
  socket.on('make-private-room', (payload) => {
    socket.join(payload)
  })
  socket.on('send-message', (payload) => {
    console.log(payload)
    const room = payload.room
    
    db.query(`INSERT INTO messages (sender,receiver,imagechat,msg) VALUES ('${payload.username}','${payload.room}','${payload.image}','${payload.chatData}')`, (err,result) => {
      if (err) {
        console.log(err)
      } else {
        io.to(room).emit('private-message', {
          sender: payload.username,
          msg: payload.chatData,
          receiver: room,
          image: payload.image
        })
      }
    })
  })
  socket.on('get-history-message', (payload) => {
    db.query(`SELECT * FROM messages WHERE (sender='${payload.sender}' 
    AND receiver='${payload.receiver}') OR (sender='${payload.receiver}' AND receiver='${payload.sender}')`, (err,result) => {
      if (err) {
        console.log(err.message);
      }else{
        io.to(payload.sender).emit('historyMessage', result)
      }
    })
  })
})


app.use(express.static('./src/uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

app.use('/users', usersRouter);


server.listen(env.port, () => {
  console.log(`Server started on port : ${env.port}`);
});