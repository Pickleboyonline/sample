import React, { Component } from 'react'
import { Text, View, StyleSheet, Dimensions, TextInput, Animated, Easing, TouchableOpacity } from 'react-native'

const AnimTouch = Animated.createAnimatedComponent(TouchableOpacity);

export default class InputContainer extends Component {
    state = {
        numberOfLines: 1,
        message: '',
        scale: new Animated.Value(.01),
        visible: false,
        width: width - (46 * 2 + 20)
    }

    animateSendIn = () => {
        Animated.timing(this.state.scale, {
            toValue: 1,
            duration: 200,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true
        }).start()
    }

    animateSendOut = () => {
        Animated.timing(this.state.scale, {
            toValue: 0.01,
            duration: 200,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true
        }).start()
    }

    componentDidMount() {
        // this.state.scale.setValue(0)
        if (this.props.focus === true) {
            this.composer.focus()
        }
        setTimeout(() => this.setState({ width: width - (46 * 3 - 2) }), 1000)

        this.state.scale.setValue(0.01)
    }

    componentDidUpdate() {
        if (this.props.focus === true) {
            //  if (this.state.message.length === 0) this.state.scale.setValue(0.01)
            this.composer.focus()
        } else if (this.props.focus === false) {
            this.composer.blur();
        }
    }


    _handleOnChangeText = (name, value) => {
        //var lines = value.split(/\r\n|\r|\n/).length
        //if (lines < 5) this.setState({ numberOfLines: lines, [name]: value, })
        // // console.log(value)
        if (value.length > 0 && this.state.visible === false) {
            this.setState({
                [name]: value,
                visible: true
            }, () => this.animateSendIn())
        } else if (value.length > 0) {
            this.setState({
                [name]: value,

            })
        } else {
            this.setState({
                [name]: value,
                visible: false
            }, () => this.animateSendOut())
        }

    }


    render() {
        const onSend = this.props.onSend || alert;
        return (
            <View style={styles.root}>
                <View style={styles.roundedContainer}>

                    <View style={styles.inputContainer}>
                        <View style={{ justifyContent: 'flex-end', height: '100%' }}>
                            <View style={[
                                styles.inputSendOuter,
                                {
                                    backgroundColor: 'transparent',
                                    // borderColor: 'rgba(255,255,255,.)',
                                    // borderWidth: .5,
                                    marginRight: 5
                                }]}>
                                <Text style={[styles.inputSendIcon, { color: 'rgba(255,255,255,.9)' }]}>
                                    music_note
                        </Text>
                            </View>
                        </View>
                        <TextInput
                            ref={(input) => { this.composer = input; }}
                            underlineColorAndroid='transparent'
                            spellCheck={false}
                            keyboardAppearance='default'
                            // returnKeyType=''
                            returnKeyLabel='Send'
                            enablesReturnKeyAutomatically
                            blurOnSubmit={false}
                            placeholderTextColor='white'
                            //textBreakStrategy='highQuality'
                            multiline
                            maxLength={100}
                            onChangeText={(text) => this._handleOnChangeText('message', text)}
                            value={this.state.message}
                            //numberOfLines={this.state.numberOfLines}
                            autoCorrect={true}
                            style={[styles.textInput, { width: this.state.width }]}
                            placeholder="Type something cool..."
                        />
                        <View style={{ justifyContent: 'flex-end', height: '100%' }}>
                            <AnimTouch
                                onPress={() => {
                                    onSend(this.state.message)
                                    this.setState({
                                        message: '',
                                        visible: false
                                    }, this.animateSendOut)
                                }}
                                style={[
                                    styles.inputSendOuter,
                                    {
                                        transform: [
                                            {
                                                scale: this.state.scale
                                            }
                                        ]
                                    }
                                ]} >
                                <Text style={styles.inputSendIcon}>
                                    send
                        </Text>
                            </AnimTouch>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    roundedContainer: {
        width: width - 25,
        minHeight: 50,
        // maxHeight: 100,
        borderRadius: 25,
        // backgroundColor: 'grey'
    },
    inputContainer: {
        flex: 1,
        borderRadius: 25,
        paddingLeft: 2,
        paddingRight: 2,
        backgroundColor: '#333333',
        flexDirection: 'row',
        alignItems: 'center'
    },
    textInput: {
        color: 'rgba(255,255,255,1)',
        // flex: 1,
        // width: '97%',
        fontSize: 16,
        marginTop: 6,
        marginBottom: 6,
        // backgroundColor: 'green'
    },
    inputActionIcon: {
        fontFamily: 'icon',
        color: 'rgba(255,255,255,.5)',
        fontSize: 24,
        //paddingLeft: 5,
        paddingRight: 10,
    },
    inputSendIcon: {
        fontFamily: 'icon',
        color: 'rgba(255,255,255,1)',
        fontSize: 24,
        textAlign: 'center',

        //paddingLeft: 5,
        //paddingRight: 10,
    },
    inputSendOuter: {
        backgroundColor: '#fb40ba',
        // borderColor: 'rgba(0,0,0,.9)',
        // borderWidth: 1,
        marginBottom: 2,
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 46,
        height: 46,
        borderRadius: 46 / 2
    }
})