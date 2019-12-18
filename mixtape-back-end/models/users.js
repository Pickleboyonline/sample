// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// TODO: add more data like array for subbs, and publisher id's
// set up a mongoose model and pass it using module.exports

var spotifySchema = new Schema({
    id: String,
    email: String,
    dob: Date,
    accessToken: String,
    refreshToken: String
});

let usersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    isForegrounded: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        default: ''
    },
    avatarFileName: {
        type: String,
        default: null
        // required: true
    },
    latestClientVersion: {
        type: Number,
        default: 0
    },
    passwordHash: {
        type: String,
        required: true
    },
    passLastModified: {
        type: Date,
        required: true
    },
    expoNotificationToken: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        unique: true,
        index: true,
        required: true,
        match: /^(?=.{2,20}$)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/
    },
    specialID: String,
    email: {
        type: String,
        unique: true,
        index: true,
        required: true,
        match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    phoneNumber: {
        type: String,
        required: true
    },
    spotify: spotifySchema,
    subscriptions: {
        type: [String],
        default: []
    },
    subscribers: {
        type: [String],
        default: []
    },
    subscribingCount: {
        type: Number,
        default: 0
    },
    subscriberCount: {
        type: Number,
        default: 0
    },
    whitelists: {
        type: [String],
        default: []
    },
    updating: {
        type: Boolean,
        default: false
    },
    polling: {
        type: Boolean,
        default: false
    },
    currentlyPlaying: {
        type: Schema.Types.Mixed,
        default: null
    },
    hasLoggedIn: {
        type: Boolean,
        default: false
    }
})


usersSchema.index({
    name: 'text'
})


module.exports = mongoose.model('users', usersSchema);


