import React, { Component } from 'react'
import {
    Text, View,
    Dimensions,
    RefreshControl,
    SectionList,
    Platform,
    TouchableOpacity,
    NativeModules, Alert,
    LayoutAnimation, YellowBox,
} from 'react-native'
import Card from './../../components/Card';
import CardLegacy from './../../components/CardLegacy'
import ActionButton from 'react-native-action-button';
import ButtonFilled from './../../ButtonFilled'
import { Audio, SecureStore } from 'expo';
import Radio from './../../components/Radio';
import playlist from './../../playlist-client/index';
import SpotifyPlayer from './../../Natives/SpotifyPlayer'
import Spinner from 'react-native-loading-spinner-overlay';
// import SuggestedFollower from './../../components/SuggestedFollower'
import SuggestedFollowerSection from './../../components/SuggestedFollowerSection'

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);

export default class componentName extends Component {
    state = {
        isActionButtonVisible: true,
        cardList: [],
        dummy: null,
        refreshing: false,
        lastRefresh: new Date(),
        currentPlayingSongId: '',
        spotifyPremium: false,
        visible: false
    }

    async componentDidMount() {
        console.ignoredYellowBox = ['Remote debugger'];

        YellowBox.ignoreWarnings([
            'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?',
            'Player does not exist'

        ]);
        try {
            // let token = await SecureStore.getItemAsync('x-auth-token');
            playlist.configUrl();

            this._onRefresh();
            Audio.setIsEnabledAsync(true)


            global.refreshFeed = this._onRefresh;
            global.changeCurrentPlayingSongId = this.changeCurrentPlayingSongId;

            // Your sound is playing!
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                playThroughEarpieceAndroid: false
            });


        } catch (e) {
            alert(e.message)
        }
        // setTimeout(() => this.updateSpotifyPremiumCard(), 2000)
        // this.nativeSpotifyPlayerIosTester()
        this.updateSpotifyPremiumCard()
    }

    nativeSpotifyPlayerIosTester = async () => {
        try {
            console.log('subscribing to spotify...')
            SpotifyPlayer.subscribe()


            //console.log(SpotifyPlayer)
            //alert('Hello?')
        } catch (e) {
            console.log(e)
        }

    }

    updateSpotifyPremiumCard = async () => {
        console.log(global.isSpotifyActivated)
        if (global.isSpotifyActivated) {

            this.setState({
                spotifyPremium: true,
                visible: false
            })
        }

        else if (SpotifyPlayer) {
            let cancelled = await SecureStore.getItemAsync("isSpotifyPremiumCancelled")

            if (cancelled) {

                return

            }

            let isPremiumSpotify = await SecureStore.getItemAsync("isPremiumSpotify")

            if (isPremiumSpotify) {
                if (Platform.OS === 'android') {
                    global.isSpotifyActivated = true
                    console.log('enabled')
                    await SpotifyPlayer.start()
                    let isPremium = await SpotifyPlayer.isPremium()

                    if (isPremium && Platform.OS === 'android') {

                        // enable premium in cards
                        SpotifyPlayer.subscribe()
                        this.setState({
                            spotifyPremium: true,
                            visible: false
                        })

                        // alert('Done :)')
                    }
                } else {
                    this.setState({
                        spotifyPremium: true,
                        visible: false
                    })
                }

            } else {
                Alert.alert(
                    'Full Song Support',
                    "We've detected that this app version supports full song playback for Spotify premium users. Would you like to enable it? Note: This only works for Spotify premium users, DON'T enable this if you are not one! This can be changed in the settings page.",
                    [
                        {
                            text: 'No',
                            onPress: async () => {
                                await SecureStore.setItemAsync("isSpotifyPremiumCancelled", "true")
                            },
                            style: 'cancel'
                        },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                if (Platform.OS === 'android') {
                                    try {

                                        await SpotifyPlayer.start()
                                        let isPremium = await SpotifyPlayer.isPremium()

                                        if (isPremium) {
                                            // enable premium in cards
                                            SpotifyPlayer.subscribe()
                                            console.log('enabled')
                                            this.setState({
                                                spotifyPremium: true,
                                                visible: false
                                            })
                                            alert('Done :)')
                                            SecureStore.setItemAsync("isPremiumSpotify", "true")
                                        } else {
                                            this.setState({ visible: false })
                                            alert('Sorry, you are not a premium user :(')
                                        }
                                    } catch (e) {
                                        this.setState({ visible: false })
                                        setTimeout(() => alert(e.message), 500)
                                    }
                                } else {
                                    SecureStore.setItemAsync("isPremiumSpotify", "true")
                                    this.setState({
                                        spotifyPremium: true,
                                        visible: false
                                    })
                                }

                            }
                        },
                    ],
                    { cancelable: false }
                )

            }


        }
    }

    // 2. Define a variable that will keep track of the current scroll position
    //_listViewOffset = 0




    _onRefresh = async () => {

        try {
            if (this.state.refreshing === false) {
                this.setState({ refreshing: true });
                let result = await playlist.getPlaylistFeed(10)
                let playlists = result.playlists;



                // // console.log(playlists)
                if (playlists.length === 0) {
                    let { users } = await playlist.getSuggestedFriends()

                    this.setState({
                        cardList: [{
                            nothing: true,
                            _id: 'nothing',
                            users
                        }],
                        refreshing: false
                    }, () => console.log('refreshing is false'))
                } else {
                    // LayoutAnimation.spring();
                    let { users } = await playlist.getSuggestedFriends()
                    let position = Math.round(Math.random() * 5 + 1)
                    if (users.length !== 0) playlists.splice(position, 0, { suggestedFriends: true, users: users, _id: 'suggested' });

                    LayoutAnimation.easeInEaseOut()
                    this.setState({
                        cardList: playlists,
                        refreshing: false
                    }, () => console.log('refreshing is false'))
                }


            } else {
                this.setState({
                    refreshing: false
                })
            }

        } catch (e) {
            console.warn(e)
            alert(e.message)
            this.setState({
                // cardList: listItems,
                refreshing: false
            }, () => console.log('refreshing is false'))
        }


    }

    _onEndReach = async () => {
        // console.log('heydsd')

        if (!this.state.cardList[this.state.cardList.length - 1]) return;
        // console.log("exec")
        try {
            var t1 = this.state.lastRefresh;
            var t2 = new Date();
            var dif = t1.getTime() - t2.getTime();

            var seconds = Math.abs(dif / 1000);
            // console.log(seconds)


            if ((seconds > 5) && (this.state.refreshing === false)) {

                this.setState({ refreshing: true });
                //await this.asyncSetState({
                //    refreshing: true
                //})
                let cardList = this.state.cardList;
                const lastId = cardList[cardList.length - 1]._id;
                let result = await playlist.getPlaylistFeed(10, lastId);
                let playlists = result.playlists;
                // // console.log(playlists)
                let tempArray = cardList.concat(playlists)
                let timestamp = new Date()
                this.setState({
                    cardList: tempArray,
                    refreshing: false,
                    lastRefresh: timestamp
                }, () => console.log('refreshing now false (and refreshed)'))
                // return;
            } else {
                // // console.log((seconds > 1) && (this.state.refreshing === false))
                this.setState({ dummy: false });

                // console.log('break!')
            }




        } catch (e) {
            console.warn(e.message)
            // // console.log(e)
            this.setState({ refreshing: false });

        }

    }


    changeCurrentPlayingSongId = (id) => {
        this.setState({
            currentPlayingSongId: id
        })
    }



    render() {
        const { height, width } = Dimensions.get('window')
        const styles = {
            wrapper: {
                flex: 1,
                width: width
            },
            padding: {
                width: '100%',
                height: 80,
            }
        }
        let options = {
            progressViewOffset: 50
        }
        if (Platform.OS === 'ios') {
            options = {}
        }


        // // console.log(cardList);
        return (
            <View style={styles.wrapper}>
                {false &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ButtonFilled
                            onPress={this.nativeSpotifyPlayerIosTester
                            }
                            style={{
                                backgroundColor: 'rgba(0,0,0,.3)',
                                borderColor: 'rgba(0,0,0,.3)'
                            }}
                            textStyle={{
                                fontFamily: 'poppins-thin',
                                fontSize: 15,
                            }}
                            title="Try to use Spotify :|"
                        />

                        <ButtonFilled
                            onPress={() => {
                                SpotifyPlayer.play("spotify:track:4qKcDkK6siZ7Jp1Jb4m0aL")
                            }
                            }
                            style={{
                                backgroundColor: 'rgba(0,0,0,.3)',
                                borderColor: 'rgba(0,0,0,.3)'
                            }}
                            textStyle={{
                                fontFamily: 'poppins-thin',
                                fontSize: 15,
                            }}
                            title="Play a song"
                        />
                    </View>}


                {true &&

                    <SectionList
                        contentContainerStyle={{

                            paddingBottom: 100,
                        }}
                        overScrollMode="never"
                        ref={(ref) => this.props.setScrollViewRef(ref)}
                        stickySectionHeadersEnabled={false}
                        renderItem={({ item, index, section }) => {
                            if (item.nothing) {
                                return (
                                    <View

                                        style={{


                                            // alignItems: 'center'
                                        }}>
                                        <View style={{
                                            margin: 15,
                                            // flexDirection: 'row'
                                            elevation: 2,

                                            padding: 8,
                                            minHeight: 100,
                                            backgroundColor: '#d800cd',
                                            borderRadius: 5
                                        }}>
                                            <Text style={{
                                                color: 'white',
                                                // maxWidth: 230,
                                                opacity: .9,
                                                fontSize: 14,
                                                fontFamily: 'open-sans-regular',
                                            }}>
                                                Nothing here yet! Add some friends to see their shared songs.

                                            </Text>
                                            <TouchableOpacity style={{

                                                position: 'absolute',
                                                bottom: 10,
                                                right: 10,

                                            }}
                                                onPress={() => {
                                                    this.props.navigation.navigate('AddFriend', {
                                                        messageContext: this
                                                    })
                                                }}

                                            >
                                                <Text style={{
                                                    color: 'white',
                                                    // maxWidth: 230,

                                                    opacity: .9,
                                                    fontSize: 12,
                                                    fontFamily: 'open-sans-bold',
                                                }}>

                                                    {'Search for friends'.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>

                                        </View>

                                        <View style={{ width: '100%' }}>
                                            <SuggestedFollowerSection users={item.users} navigation={this.props.navigation} />
                                        </View>
                                    </View>
                                )
                            } else if (item.suggestedFriends) {
                                // return null
                                return <SuggestedFollowerSection key={item._id} users={item.users} navigation={this.props.navigation} />
                            }
                            else {
                                if (this.state.spotifyPremium) {
                                    return (
                                        <Card
                                            createdAt={item.createdAt}
                                            username={item.username}
                                            tracks={item.tracks}
                                            changeCurrentPlayingSongId={this.changeCurrentPlayingSongId}
                                            currentPlayingSongId={this.state.currentPlayingSongId}
                                            description={item.description}
                                            key={item._id}
                                            _id={item._id}
                                            liked={item.liked}
                                            likeCount={item.likeCount}
                                            lastComment={item.lastComment}
                                            navigation={this.props.navigation}
                                        />
                                    )
                                } else {
                                    return (
                                        <CardLegacy
                                            createdAt={item.createdAt}
                                            username={item.username}
                                            tracks={item.tracks}
                                            changeCurrentPlayingSongId={this.changeCurrentPlayingSongId}
                                            currentPlayingSongId={this.state.currentPlayingSongId}
                                            description={item.description}
                                            key={item._id}
                                            _id={item._id}
                                            liked={item.liked}
                                            likeCount={item.likeCount}
                                            lastComment={item.lastComment}
                                            navigation={this.props.navigation}
                                        />
                                    )

                                }

                            }
                        }

                        }
                        // initialNumToRender={0}
                        renderSectionHeader={({ section: { title } }) => <Radio />}
                        sections={[
                            { title: 'Radio', data: this.state.cardList },
                        ]}
                        onEndReachedThreshold={0.05}
                        refreshing={this.state.refreshing}
                        onEndReached={this._onEndReach}
                        refreshControl={
                            <RefreshControl
                                {...options}
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}
                            />
                        }
                        keyExtractor={(item, index) => item._id}
                    //style={{}}


                    />}








            </View>
        )
    }
}