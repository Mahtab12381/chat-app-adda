const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const databaseConnection = require('./config/database');
const dotenv = require('dotenv');
dotenv.config();

const auth = require('./routes/authRoutes');
const user = require('./routes/userRoutes');
const chat = require('./routes/chatRoutes');
const message = require('./routes/messageRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', auth);
app.use('/user', user);
app.use('/chat', chat);
app.use('/message', message);

app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        'body' in err
    ) {
        return res.status(400).send({ message: 'Invalid JSON syntax!' });
    }
    next();
});



// using route() method to get the invalid routes
app
    .route('*')
    .get((req, res) => {
        res.status(400).send('Invalid route!');
    })
    .put((req, res) => {
        res.status(400).send('Invalid route!');
    })
    .post((req, res) => {
        res.status(400).send('Invalid route!');
    })
    .delete((req, res) => {
        res.status(400).send('Invalid route!');
    });

databaseConnection(() => {
    const server = app.listen(3000, () => {
        console.log('Server is running on 3000...');
    });
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: process.env.FRONTEND_URL,
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('setup', (userData) => {
            socket.join(userData);
            console.log('UserConnected: ' + userData);
            socket.emit('connected');
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log('User joined room: ' + room);
        });

        socket.on('new message', (newMessageReceived) => {
            var chat = newMessageReceived.chat;
            
            if(!chat.participants) return console.log('Chat.participants not defined');
            
            chat.participants.forEach((participant) => {
              
                if(participant == newMessageReceived.sender._id){
                    return;
                };
                socket.in(participant).emit('message received', newMessageReceived);
            });
        });

        socket.on('typing', (room) => {
            socket.in(room).emit('typing', room);
        });

        socket.on('stop typing', (room) => {
            socket.in(room).emit('stop typing', room);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
});
