import React, { Component } from 'react'
import { Text, View, FlatList, StyleSheet, KeyboardAvoidingView, Keyboard, Dimensions, Animated } from 'react-native'
import InputContainer from './InputContainer'
import MessageWithAvatar from './MessageWithAvatar';
import MessageSender from './MessageSender';
import playlist from './../../playlist-client/index';
import { Notifications } from 'expo'
var io = require('socket.io-client');


var messageStruct = {
    type: ['sender', 'reciever'],
    messages: [Object],
    avatar: Boolean,
    lastId: ''
}

var MessageAdder = {
    add: (context, message) => {
        let currentMessageGroups = context.state.messageGroups;
        if (currentMessageGroups.length === 0) {
            // // console.log('hey')
            context.setState({
                messageGroups: [{
                    type: message.type,
                    messages: [{ message: message.message }]
                }]
            }) //, () => // console.log(message))

        } else {

            let lastTypeOfMessage = currentMessageGroups[0].type;

            if (lastTypeOfMessage === message.type) {

                currentMessageGroups[0].messages = currentMessageGroups[0].messages.concat([{ message: message.message }])


                context.setState({
                    messageGroups: currentMessageGroups
                })

            } else {
                let editedMessageGroups = [{
                    type: message.type,
                    messages: [{ message: message.message }]
                }].concat(currentMessageGroups)

                context.setState({
                    messageGroups: editedMessageGroups
                })
            }
        }
    },
}



const { height } = Dimensions.get('window')

export default class ChatView extends Component {
    state = {
        height: new Animated.Value(height),
        messageGroups: [],
        currentConversationId: '',
        didFirstConnect: false,
        lastId: '',
        // lastRefresh: new Date()
    }
    componentWillUnmount() {
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()

    }
    async componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

        // let token = await firebase.auth().currentUser.getIdToken(true);
        // playlist.setToken(token);
        await playlist.configRealtimeToken();

        // Setup realtime chat
        var socket = io.connect(playlist.urlForImages + '/messaging', { transports: ['websocket'], secure: true });
        socket.on('connect', () => {
            socket
                .emit('authenticate', { token: playlist.realtimeToken }) //send the jwt
                .on('authenticated', () => {
                    if (this.state.didFirstConnect === false) {
                        this.socket = socket;
                        //do other things
                        //// console.log("I'm in")

                        socket.on('message sent', (message) => {
                            if (message.conversationId === this.state.currentConversationId) {
                                //// console.log('Recieved')
                                MessageAdder.add(this, {
                                    type: 'reciever',
                                    message: message.body
                                })
                            }

                        })
                        this.setState({
                            didFirstConnect: true
                        })
                    } else {
                        //  TODO: Refresh messages - DONE
                        // this._refreshMessageView()
                    }


                })
                .on('unauthorized', (msg) => {

                    console.warn(msg.data)
                })


        });
        global.eventEmitter.on('send external message', (username, message) => {
            if (this.props.currentRecieverUsername === username) {
                MessageAdder.add(this, {
                    type: 'sender',
                    message: message
                })

            }

            if (this.socket) {
                this.socket.emit('send message', message, username, (res) => {
                    // alert(res)
                })

            }
        })


    }

    _refreshMessageView = async () => {
        if (this.props.currentConversationId === '') return;

        this.setState({
            currentConversationId: this.props.currentConversationId,
            messageGroups: [],
        }, async () => {
            let { messages } = await playlist.getMessages(this.props.currentConversationId);
            // // console.log(messages[messages.length - 1]._id)
            if (messages.length !== 0) {
                this.setState({
                    lastId: messages[messages.length - 1]._id
                })
            }


            messages.reverse()

            for (let message of messages) {
                //// console.log(message)
                if (message.author === this.props.username) {
                    message.type = 'sender'
                } else {
                    message.type = 'reciever'
                }
                MessageAdder.add(this, {
                    type: message.type,
                    message: message.body
                })
            }
        })

    }




    async componentDidUpdate() {
        if (this.props.currentConversationId !== this.state.currentConversationId) {

            this._refreshMessageView()

        }
    }

    _handleOnEndReached = async () => {
        // console.log('last id:' + this.state.lastId)
        let { messages } = await playlist.getMessages(this.props.currentConversationId, this.state.lastId);
        // console.log(messages.length)
        if (messages.length === 0 || this.state.lastId === '') return true;
        // console.log(messages[messages.length - 1]._id)
        this.setState({
            lastId: messages[messages.length - 1]._id
        })

        messages.reverse()


        let tempArray = [...this.state.messageGroups]
        this.setState(({
            messageGroups: []
        }))

        for (let message of messages) {
            //// console.log(message)
            if (message.author === this.props.username) {
                message.type = 'sender'
            } else {
                message.type = 'reciever'
            }
            MessageAdder.add(this, {
                type: message.type,
                message: message.body
            })
        }
        this.setState({
            messageGroups: [...tempArray, ...this.state.messageGroups]
        })

    }

    _keyboardDidShow = (key) => {
        this.state.height.setValue(height - key.endCoordinates.height)

    }
    _keyboardDidHide = (key) => {
        this.state.height.setValue(height)

    }

    _sendToServer = (message) => {
        this.props.updateConversationLastTime(this.props.currentRecieverUsername)
        this.socket.emit('send message', message, this.props.currentRecieverUsername, (res) => {

        })
    }

    _handleOnSend = (message) => {

        MessageAdder.add(this, {
            type: 'sender',
            message: message
        })
        if (this.socket) this._sendToServer(message)
    }

    render() {
        return (
            <Animated.View style={{ height: this.state.height }}>

                <FlatList
                    keyboardShouldPersistTaps='always'
                    ref={ref => this.scrollView = ref}
                    // alignContent="flex-end"
                    onEndReachedThreshold={.1}
                    onEndReached={this._handleOnEndReached}
                    contentContainerStyle={{
                        paddingTop: 90,
                        paddingBottom: 90,
                        paddingLeft: 15,
                        paddingRight: 15
                    }}
                    data={this.state.messageGroups}
                    inverted
                    style={styles.messageContainer}
                    renderItem={({ item, index }) => {
                        if (item.type === 'sender') return <MessageSender messages={item.messages} key={index.toString()} />
                        return <MessageWithAvatar messages={item.messages} key={index.toString()} currentRecieverUsername={this.props.currentRecieverUsername} />
                        //return <MessageWithAvatar key={index.toString()} text={item.text} />
                        //  return <MessageSender text={item.text} key={index.toString()} />
                    }
                    }
                    keyExtractor={(item, index) => index.toString()}
                />


                <View

                    style={styles.inputParent} >
                    <InputContainer focus={this.props.focus} onSend={this._handleOnSend} />
                </View>

            </Animated.View>
        )
    }
}


const styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        // marginTop: 65,
        // backgroundColor: 'red',

    },
    inputParent: {
        minHeight: 80,
        // backgroundColor: 'green',
        position: 'absolute',
        width: '100%',
        bottom: 5
    },
    messageText: {
        color: 'white'
    }
})