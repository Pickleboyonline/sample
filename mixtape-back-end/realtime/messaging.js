var socketioJwt = require('socketio-jwt');
var Message = require('./../models/messages');
var Conversation = require('./../models/conversations');
var sendNotification = require('./../lib/sendNotification');
var User = require('./../models/users');


function addMessaging(io) {
    var messaging = io.of('/messaging');
    // var polling = new Polling();


    messaging
        .on('connection', socketioJwt.authorize({
            secret: 'SECRET',
            timeout: 15000 // 15 seconds to send the authentication message
        })).on('authenticated', async (socket) => {
            // this socket is authenticated, we are good to handle more events from it.
            let user = await User.findById(socket.decoded_token._id, "username").lean().exec()
            // TODO: use id instead of username (for population)
            socket.join(user.username);
            console.log('welcome to messaging! ' + user.username)
            socket.on('send message', async (message, recipient, cb) => {
                const timestamp = new Date();
                // Check if both parties consent to messaging
                let conversation = await Conversation.findOne({
                    agreedParticipants: {
                        $all: [socket.decoded_token.username, recipient]
                    }
                }).lean().exec()

                // Save and send message
                if (conversation) {

                    messaging.to(recipient).emit('message sent', {
                        conversationId: conversation._id,
                        body: message,
                        author: socket.decoded_token.username,
                        createdAt: timestamp
                    })

                    let messageDoc = new Message({
                        conversationId: conversation._id,
                        body: message,
                        author: socket.decoded_token.username,
                        createdAt: timestamp
                    })

                    let savedMessage = await messageDoc.save()


                    let { expoNotificationToken, isForegrounded } = await User.findOne({ username: recipient }).lean().exec()
                    // TODO: make not send notifications if on socket

                    if (global.notificationsNamespace) {


                        if (isForegrounded === undefined) isForegrounded = false;

                        // Plz !isForegrounded find a way to fix this for android
                        if (expoNotificationToken) {
                            sendNotification({
                                title: 'Message from ' + socket.decoded_token.username,
                                body: message,
                                sound: 'default',
                                data: {
                                    type: 'message',
                                    from: socket.decoded_token.username,
                                    conversationId: conversation._id
                                }
                            }, expoNotificationToken)
                        }
                        global.notificationsNamespace.to(recipient)
                            .emit('messaged', socket.decoded_token.username, conversation._id)





                    }





                    // Can now save in db to convo (last time)

                    await Conversation.findOneAndUpdate({
                        agreedParticipants: {
                            $all: [socket.decoded_token.username, recipient]
                        }
                    }, {
                        lastModified: timestamp
                    }).exec()

                    try {
                        if (cb) cb(savedMessage._id)
                    }
                    catch (e) {

                    }
                } else {
                    cb("Can't send massage, the reciever must add you back.")
                }

                console.log(message)
            })
            socket.on('disconnect', () => {

                console.log('this should not appear ;(')
            })

        });

}


module.exports = addMessaging;