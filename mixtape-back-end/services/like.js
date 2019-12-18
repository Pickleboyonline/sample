var Likes = require('./../models/likes');
var express = require('express')
var router = express.Router()
var wrapAsync = require('express-async-handler');
var assert = require('assert');
var Playlist = require('./../models/playlists')
var Notification = require('./../models/notifications')
var sendNotification = require('./../lib/sendNotification')
var User = require('./../models/users')

router.post('/like/:id', wrapAsync(async (req, res) => {
    const { _id, username } = req.user;
    const playlistId = req.params.id;

    assert.ok(playlistId, "Must give playlist");
    let doc = await Likes.findOne({
        user: _id,
        playlist: playlistId
    }).exec()
    // global.notificationEvents.emit('notify')
    if (doc) {
        res.json({
            message: 'You have liked the playlist'
        })
    } else {
        let timestamp = new Date()
        let like = new Likes({
            playlist: playlistId,
            user: _id,
            createdAt: timestamp
        })

        let error = like.validateSync();
        if (error) throw error;

        // Save it

        await like.save()

        let doc = await Playlist.findByIdAndUpdate(playlistId, {
            $inc: { likeCount: 1 }
        }).lean().exec()

        // Changed to not liking your own music
        if (global.notificationsNamespace && (doc.username !== username)) {

            global.notificationsNamespace.to(doc.username).emit('liked', username, doc)
        }

        res.json({
            message: 'You have liked the playlist'
        })
        //const timestamp = new Date()
        // TODO: get if user is active - maybe

        // Dont send anything if its you
        if (doc.username === username) return

        let notificationDoc = new Notification({
            createdAt: timestamp,
            modifiedAt: timestamp,
            forUsername: username,
            forUser: doc.user,
            read: false,
            payload: {
                type: 'liked',
                from: req.user.username,
                post: doc
            }


        })
        notificationDoc.save()

        // Push notifactiosn for likes

        let { expoNotificationToken } = await User.findById(doc.user, 'expoNotificationToken')
            .lean()
            .exec()

        if (expoNotificationToken) {
            sendNotification({
                title: 'A like from ' + username,
                body: '' + username + ' liked your post!',
                sound: 'default',
                data: {
                    type: 'liked',
                    from: username,
                    post: doc
                }
            }, expoNotificationToken)
        }


        // global.notificationEvents.emit('notify');
    }



}))

router.delete('/like/:id', wrapAsync(async (req, res) => {
    const { _id } = req.user;
    const playlistId = req.params.id;

    assert.ok(playlistId, "Must give playlist");

    // let timestamp = new Date()


    await Likes.findOneAndRemove({
        user: _id,
        playlist: playlistId
    }).exec()

    await Playlist.findOneAndUpdate({
        _id: playlistId,
        likeCount: { $gt: 0 }
    }, {
            $inc: { likeCount: -1 }
        }).exec()



    res.json({
        message: 'You have disliked the playlist'
    })
}))

// Change to like pagination ;)
router.get('/likes/:id', wrapAsync(async (req, res) => {
    const { _id } = req.user;
    const playlistId = req.params.id;

    assert.ok(playlistId, "Must give playlist");

    // let timestamp = new Date()


    let docs = await Likes.find({
        playlist: playlistId
    }).populate('user', 'name username avatarFileName').lean().exec()

    let newDocs = await Promise.resolve(docs.map((doc) => {
        // doc.toObject()
        let isYou = false
        if (doc.user._id.toString() === _id.toString()) isYou = true
        let added = false
        if (req.user.subscriptions.includes(doc.user.username.toString()) === true) added = true
        return Object.assign(doc.user, { isYou: isYou, added: added })
    }))



    res.json({
        message: 'Here are your likes',
        likes: newDocs
    })
}))



module.exports = router;