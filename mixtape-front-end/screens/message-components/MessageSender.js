import React, { Component } from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'
import Message from './Message';

export default class MessageSender extends Component {
    render() {

        return (
            <View style={styles.root}>

                {
                    this.props.messages.map((item, index) => <Message text={item.message} sender key={index} />)
                }
            </View>
        )
    }
}


const styles = StyleSheet.create({
    root: {
        // flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-end',
        marginTop: 10
        // backgroundColor: 'green'
    },
    messageColor: {
        backgroundColor: '#fb40ba'
    }
})

