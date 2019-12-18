var User = require('./../models/users');
var express = require('express')
var router = express.Router()
var wrapAsync = require('express-async-handler');
var Conversation = require('./../models/conversations')
var client_id = 'CLIENTID'; // Your client id
var client_secret = 'CLIENT_SECRET'; // Your secret
var redirect_uri = 'http://192.168.1.75/spotify/callback'; // Your redirect uri
var SpotifyWebApi = require('spotify-web-api-node');
var assert = require('assert');
var Comments = require('./../models/comments')
var Playlists = require('./../models/playlists')
var sendNotification = require('./../lib/sendNotification')

router.post('/comments/:id', wrapAsync(async (req, res) => {
    const _id = req.user._id;
    var username = req.user.username;
    let playlist = req.params.id;
    let body = req.body.body;
    const expoNotificationToken = req.user.expoNotificationToken

    assert.ok(body, 'Must give body')
    assert.ok(playlist, 'Must give playlist to comment on')



    let timestamp = new Date()
    let comment = new Comments({
        username,
        user: _id,
        createdAt: timestamp,
        lastModified: timestamp,
        playlist,
        body
    })

    let validateError = comment.validateSync();
    // console.log(validateError);
    if (validateError) throw validateError;
    await comment.save()

    let doc = comment.toObject()

    let post = await Playlists.findByIdAndUpdate(playlist, {
        $set: {
            lastComment: doc
        },
        $inc: {
            commentCount: 1
        }
    }).lean().exec();

    let user = await User.findOne({ username: post.username }, "expoNotificationToken")
        .lean().exec()

    if (global.notificationsNamespace) {
        global.notificationsNamespace.to(post.username)
            .emit('commented', username, post, doc)
    }

    if (user.expoNotificationToken) {
        sendNotification({
            title: 'Comment by ' + req.user.username,
            body: body,
            sound: 'default',
            data: {
                type: 'commented',
                from: req.user.username,
                post: post,
                comment: doc

            }
        }, user.expoNotificationToken)
    }



    res.json({
        message: 'Comment was created successfully'
    })
}))


router.get('/comments/:id', wrapAsync(async (req, res) => {
    var lastId = req.query.lastId;
    const limit = 10;
    const playlistId = req.params.id;
    // const subscriptions = req.user.subscriptions;

    assert.ok(playlistId, "Must give playlist ID")

    let query = {
        playlist: playlistId,
    }
    if (lastId) {
        query._id = {
            $lt: lastId
        }
    }
    // console.log(query);

    let comments = await Comments
        .find(query)
        .limit(limit)
        .sort('-createdAt')
        .lean()
        .exec();

    assert.ok(comments, "No comments were found")
    res.json({
        message: 'Comments were found',
        comments,
        // lastId: playlists[playlists.le]
    })
}))


module.exports = router;