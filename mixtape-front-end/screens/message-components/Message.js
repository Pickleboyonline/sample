import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'

export default class Message extends Component {
    render() {
        const isSender = this.props.sender || false;
        return (
            <View style={StyleSheet.flatten([styles.root, isSender && styles.sender])}>
                <Text style={styles.text} > {this.props.text} </Text>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    root: {
        maxWidth: 220,
        // minHeight: 40,
        borderRadius: 18,
        backgroundColor: '#333333',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        //justifyContent: 'center',
        marginBottom: 3
    },
    text: {
        fontSize: 16,
        color: 'white',
        textAlign: 'left'
        // includeFontPadding: false
    },
    sender: {
        backgroundColor: '#fb40ba'
    }

})