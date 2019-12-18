var admin = require("firebase-admin");
var express = require('express')
var app = express()
var errorhandler = require('errorhandler')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var users = require('./services/users');
var playlists = require('./services/playlists');
var spotify = require('./services/spotify')
var realtimeAuth = require('./services/realtime');
var jwt = require('jsonwebtoken');
var search = require('./services/search');
var addRadio = require('./realtime/radio');
var addMessaging = require('./realtime/messaging')
var addNotifications = require('./realtime/notifications')
var conversations = require('./services/conversations')
var messages = require('./services/messages')
var comments = require('./services/comments')
var openUsers = require('./services/openUsers')
var like = require('./services/like');
var images = require('./services/images')
var path = require('path')
var fs = require('fs');
var assert = require('assert');
var notifications = require('./services/notifications')
const https = require('https');
const startVersionControl = require('./lib/startVersionControl')
var compression = require('compression')
var openAdmin = require('./services/openAdmin')
var admin = require('./services/admin')
var authAdmin = require('./middleware/authAdmin')
const { isDev } = require('./config')


// CHANGED FOR DEV PURPOSES

// Create HTTPS server


var privateKey
var certificate
var ca

var credentials

var httpsServer


if (!isDev) {
    privateKey = fs.readFileSync('/etc/letsencrypt/live/getmixtape.app/privkey.pem', 'utf8');
    certificate = fs.readFileSync('/etc/letsencrypt/live/getmixtape.app/cert.pem', 'utf8');
    ca = fs.readFileSync('/etc/letsencrypt/live/getmixtape.app/chain.pem', 'utf8');
    credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    }

    httpsServer = https.createServer(credentials, app);
}


// var cors = require('cors')
// Use compression for web stuff
app.use(compression())
// app.use(cors())

// Realtime
var http = require('http').Server(app);

// var io = require('socket.io')(httpsServer);
var io = require('socket.io')((isDev ? http : httpsServer));

var events = require('events');
var eventEmitter = new events.EventEmitter();
global.notificationEvents = eventEmitter;



// Adapter
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));


// Mongoose
const DATABASE_NAME = 'playlist_v2'
const mongoose = require('mongoose');


// Firebase - REMOVED
var auth = require('./middleware/auth');


// Basic Setup
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(morgan('dev'))

// open services
app.use('/api', openUsers)
app.get('/images/:filename', (req, res) => {
    var { filename } = req.params;
    assert.ok(filename, "Must give filename")

    var filePath = path.join(__dirname, 'img') + '/' + filename;
    var defaultPath = path.join(__dirname) + '/' + "dafault-profile-picture.png";
    fs.stat(filePath, function (err, stat) {
        if (err == null) {
            console.log('File exists');
            res.sendFile(filePath);
        } else if (err.code === 'ENOENT') {
            // file does not exist
            res.sendFile(defaultPath);
        } else {
            console.log('Some other error: ', err.code);
            throw new Error('' + err.code)
        }
    });
})

// Spotify Auth
app.use('/api', spotify)
app.use('/api', search);
app.use('/api', conversations)
app.use('/api', messages)


// MY Auth
app.use('/api', auth);

// Realtime Auth
app.use('/api', realtimeAuth);


// Services
app.use('/api', users);
app.use('/api', playlists);
app.use('/api', comments)
app.use('/api', like)
app.use('/api', images)
app.use('/api', notifications)

// Dummy
app.use('/dummy', (req, res) => res.json({ message: 'No you are!' }))


// Admin based routes

app.use('/admin-api', openAdmin)
app.use('/admin-api', authAdmin)
app.use('/admin-api', admin)








// Add static web site

app.use(express.static(path.join(__dirname, 'public')))

app.use('*', (req, res, next) =>
    next(new Error('Must give a valid route')))

// Error Handling
// app.use(errorhandler())
app.use((error, req, res, next) => {
    // console.log(req.ip)
    res.status(500);
    console.log(error)
    res.json({
        message: error.message
    });
});




mongoose.connect('mongodb://localhost/' + DATABASE_NAME)
    .then(() => {
        // Realtime features
        addMessaging(io)
        addRadio(io)
        addNotifications(io)
        startVersionControl().then(() => {
            let port = require('./config').port;
            if (isDev) port = 80;

            http.listen(port, () => console.log(`Example app listening on port ${port}! **${isDev ? 'DEV MODE' : 'PRODUCTION MODE'}`))
            // if (!isDev) httpsServer.listen(443, () => console.log('Example app listening on port 80!'))


        })
            .catch((err) => {
                console.log(err)
            })

    })
    .catch((e) => {
        console.log(e)
    })






