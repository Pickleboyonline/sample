import React, { Component } from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'
import Message from './Message';
import playlist from './../../playlist-client/index'
export default class MessageWithAvatar extends Component {
    render() {
        return (
            <View style={styles.root}>
                <View style={styles.avatarOuterContainer}>
                    <Image
                        style={styles.avatarImage}
                        source={{ uri: playlist.urlForImages + `/images/${this.props.currentRecieverUsername}.png` }}
                    />
                </View>
                <View style={{ flex: 1, alignItems: 'flex-start', }}>

                    {
                        this.props.messages.map((item, index) => <Message text={item.message} key={index} />)
                    }

                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        marginTop: 10
    },
    avatarOuterContainer: {
        justifyContent: 'flex-end',
        marginRight: 12
    },
    avatarImage: {
        width: 38,
        height: 38,
        borderRadius: 38 / 2,
    }
})