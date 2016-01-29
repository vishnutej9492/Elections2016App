/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    app = express(),
    server = require('http').createServer(app),
    path = require('path');
var io = require('socket.io').listen(server);

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(function (req, res, next) {
        throw new Error(req.url + ' not found');
    });
    app.use(function (err, req, res, next) {
        console.log(err);
        res.send(err.message);
    });
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.post('/vote', routes.vote);
app.post('/results', routes.results);
app.get('/chat', function (req, res) {
  res.sendfile(__dirname + '/chat.html');
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(username){
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        // echo to client they've connected
        socket.emit('updatechat', 'Status', 'you have connected');
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('updatechat', 'Status', username + ' has connected');
        // update the list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'Status', socket.username + ' has disconnected');
    });
});


server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
