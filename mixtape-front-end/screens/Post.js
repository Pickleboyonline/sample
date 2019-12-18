import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import Card from './../components/Card';
import playlist from './../playlist-client/index'
import { Ionicons } from '@expo/vector-icons';

export default class Post extends Component {
    state = {
        refreshed: false,
        likeCount: 0,
        liked: false,
        createdAt: null,
        lastComment: undefined
    }

    async componentWillMount() {
        try {
            let res = await playlist.getPlaylist(this.props.navigation.state.params._id);
            this.setState({
                refreshed: true,
                likeCount: res.playlist.likeCount,
                liked: res.playlist.liked,
                createdAt: new Date(res.playlist.createdAt),
                lastComment: res.playlist.lastComment
            })

        } catch (e) {
            console.warn(e.message)
        }
    }

    



    render() {

        let props = this.props.navigation.state.params;
        // // console.log(props)
        const { height, width } = Dimensions.get('window')
        return (
            <View style={{ flex: 1, backgroundColor: '#211F1F' }}>

                <ScrollView style={{
                    flex: 1,
                    marginTop: 80,
                    width: width
                }}>


                    <Card
                        createdAt={this.state.createdAt}
                        refreshed={this.state.refreshed}
                        username={props.username}
                        tracks={props.tracks}
                        description={props.description}
                        _id={props._id}
                        liked={this.state.liked}
                        likeCount={this.state.likeCount}
                        lastComment={this.state.lastComment}
                        navigation={this.props.navigation}
                    />

                </ScrollView>
                <View style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                    <Text style={{
                        color: 'white',
                        //marginLeft: 10,
                        marginTop: 30,
                        textAlign: 'center',
                        fontFamily: 'poppins-extra-bold-italic',
                        fontSize: 25
                    }}> Post </Text>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.pop()}
                        style={{
                            position: 'absolute',
                            top: 0,
                            marginTop: 35,
                            marginLeft: 20,
                        }}>
                        <Ionicons name="ios-arrow-back" size={30} color="rgba(255,255,255,.8)" />

                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}