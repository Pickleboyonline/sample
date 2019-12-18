import React from 'react';
import {
  StyleSheet, Text, View,
  StatusBar, Easing, Animated,
  Platform
} from 'react-native';
import Welcome from './Welcome';
import Pan from './Pan'
import { Font, AppLoading, SecureStore } from 'expo';
import {
  createStackNavigator,
  createAppContainer, createSwitchNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation';
import AuthLoadingScreen from './AuthLoadingScreen';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import RadioSwiper from './components/RadioSwiper'
import AddPlaylist from './components/AddPlaylist';
import SearchTracks from './components/SearchTracks';
import PostPlaylist from './components/PostPlaylist';
import Comments from './components/Comments'
import AddFriend from './screens/AddFriend';
import Post from './screens/Post';
import playlist from './playlist-client/index'
import Notifications from './screens/Notifications'
import Notification from './components/Notification';
import ExternalAccount from './screens/ExternalAccount'
import Settings from './screens/Settings'
import ModalComp from './screens/Modal'
import Tutorial from './Modals/Tutorial';
import AddFromContacts from './screens/AddFromContacts'
import Friends from './screens/Friends'
import Update from './screens/Update'
import Likes from './screens/Likes'
import SpotifyPlayer from './Natives/SpotifyPlayer'
import ResetPassword from './screens/ResetPassword';

var io = require('socket.io-client');
var Emitter = require('tiny-emitter');
var eventEmitter = new Emitter();





const WelcomeNav = createStackNavigator({
  Welcome: Welcome,
  Signup: Signup,
  Login: Login,
  ResetPassword
},
  {
    headerMode: 'none',

  })



const modalAnimation = sceneProps => {
  const { layout, position, scene } = sceneProps;
  const { index } = scene;

  const height = layout.initHeight;
  const translateY = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [height, 0, 0],
  })

  const opacity = position.interpolate({
    inputRange: [index - 1, index - 0.99, index],
    outputRange: [0, 1, 1],
  });

  return { backgroundColor: 'transparent', transform: [{ translateY }], opacity };
}



const HomeNav = createStackNavigator({
  Home: Home,
  RadioSwiper: RadioSwiper,

},
  {
    headerMode: 'none',
    transparentCard: true,
    mode: 'modal',
    initialRouteName: 'Home',
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        timing: Animated.timing,
      },
      screenInterpolator: modalAnimation
    })
  })




const MainNav = createStackNavigator({
  AddPlaylist: AddPlaylist,
  Default: HomeNav,
  SearchTracks: SearchTracks,
  Comments: Comments,
  ExternalAccount: ExternalAccount,
  Post: Post,
  PostPlaylist: PostPlaylist,
  AddFriend: AddFriend,
  AddFromContacts: AddFromContacts,
  Notifications: Notifications,
  Settings: Settings,
  Friends,
  Modal: ModalComp,
  Tutorial: Tutorial,
  Update,
  Likes
}, {
  headerMode: 'none',
  transitionConfig: (transitionProps, prevTransitionProps, isModal) => {
    var obj = {}
    let { transitionSpec } = StackViewTransitionConfigs.defaultTransitionConfig(transitionProps, prevTransitionProps, isModal)

    obj.transitionSpec = transitionSpec;
    return ({
      transitionSpec: obj.transitionSpec,
      screenInterpolator: sceneProps => {
        let { index } = sceneProps
        // // console.log(sceneProps)
        let routeName = sceneProps.scene.route.routeName


        if ((sceneProps.scenes[index].route.routeName === "Modal" || sceneProps.scenes[index].route.routeName === "Tutorial") && routeName !== "Settings") {
          return modalAnimation(sceneProps)
        }
        else if (routeName === "Modal") {
          return modalAnimation(sceneProps)
        }
        else if (sceneProps.scenes[index + 1]) {
          if (sceneProps.scenes[index + 1].route.routeName === "Modal" || sceneProps.scenes[index + 1].route.routeName === "Tutorial") {
            return modalAnimation(sceneProps)
          }

          else {
            return StackViewTransitionConfigs.defaultTransitionConfig(transitionProps, prevTransitionProps, isModal).screenInterpolator(sceneProps)
          }

        }


        else if (sceneProps.scenes[sceneProps.scene.index + 1]) {
          if (sceneProps.scenes[sceneProps.scene.index + 1].route.routeName === "Modal" || sceneProps.scenes[sceneProps.scene.index + 1].route.routeName === "Tutorial") {
            return modalAnimation(sceneProps)
          } else {
            return StackViewTransitionConfigs.defaultTransitionConfig(transitionProps, prevTransitionProps, isModal).screenInterpolator(sceneProps)
          }

        }

        else {
          return StackViewTransitionConfigs.defaultTransitionConfig(transitionProps, prevTransitionProps, isModal).screenInterpolator(sceneProps)
        }
      },
    })
  },


  initialRouteName: 'Default',
  cardOverlayEnabled: true,
  transparentCard: true,
  // ode: 'modal',

})

// () => ({
//   containerStyle: {
//     backgroundColor: 'transparent',
//   }
// })
const Root = createSwitchNavigator({
  AuthLoading: AuthLoadingScreen,
  Auth: WelcomeNav,
  MainNav: MainNav
}, {


  initialRouteName: 'AuthLoading',
  transparentCard: true,

})

const Parent = createAppContainer(Root);

export default class App extends React.Component {
  state = {
    fontLoaded: false,
    movement: new Animated.Value(0),
    swipeMovement: new Animated.Value(0),
    messagingUsername: ':)',
    isMessagingOpen: false,
    notifications: [],
    timesEventListernsAdded: 0,
  }

  notificationCount = 0

  render() {
    if (this.state.fontLoaded === false) {
      return (
        <AppLoading
          startAsync={this._handleCaching}
          onFinish={() => this.setState({ fontLoaded: true })}
          onError={console.warn}
        />
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Parent />
        {
          this.state.notifications
            .map((obj) => < Notification
              username={obj.username}
              onTap={obj._handleOnTap}
              deleteFunc={this.removeNotificationFromState}
              key={obj.key.toString()}
              keyNumber={obj.key}
              type={obj.type}
            />)
        }

      </View>
    );
  }



  async _handleCaching() {
    await Font.loadAsync({
      'poppins-extra-bold-italic': require('./assets/fonts/Poppins-ExtraBoldItalic.ttf'),
      'poppins-medium': require('./assets/fonts/OpenSans-Bold.ttf'),
      'poppins-thin': require('./assets/fonts/OpenSans-Light.ttf'),
      'poppins-regular': require('./assets/fonts/OpenSans-Regular.ttf'),
      'icon': require('./assets/fonts/MaterialIcons-Regular.ttf'),
      'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
      'open-sans-regular': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-light': require('./assets/fonts/OpenSans-Light.ttf'),
      'open-sans-semi-bold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    });

  }
  async componentDidMount() {

    global.eventEmitter.on('updateMessageState', (username, isOpen) => {
      // console.log('' + username + ' : ' + isOpen)
      this.setState({
        messagingUsername: username,
        isMessagingOpen: isOpen
      })
    })
    global.eventEmitter.on('readyForNotifications', async () => {
      await playlist.configRealtimeToken();
      if (this.props.exp.notification) global.notificationFromHome = this.props.exp.notification

      // Setup realtime chat
      var socket = io.connect(playlist.urlForImages + '/notifications', { transports: ['websocket'] })
      socket.on('connect', () => {
        socket
          .emit('authenticate', { token: playlist.realtimeToken })
          .on('authenticated', () => {
            if (this.state.timesEventListernsAdded === 0) {
              socket.on('alert', () => alert('you have been notified'))

              //  When you get it
              socket.on('liked', (username, post) => {
                this.addNotification(username, 'liked', post)

              })

              socket.on('added', (username) => {
                // alert('????')
                this.addNotification(username, 'added')
              })

              socket.on('commented', (username, post, comment) => {
                // TODO: add 
                // alert('commented')
                // // console.log(comment)
                this.addNotification(username, 'commented', { post, comment })
              })

              socket.on('messaged', (username, conversationId) => {
                if (this.state.isMessagingOpen === false) {
                  this.addNotification(username, 'messaged', conversationId)
                } else if (this.state.messagingUsername !== username) {
                  this.addNotification(username, 'messaged', conversationId)
                }
                global.eventEmitter.emit('updateConversationLastTime', username)
              })
              this.setState({
                timesEventListernsAdded: 1
              })
            }

          })
          .on('unauthorized', (msg) => {

            console.warn(msg.data)
          })


      });
    })
    if (Platform.OS === 'android') {

      let cancelled = await SecureStore.getItemAsync("isSpotifyPremiumCancelled")
      if (cancelled) return

      let isPremiumSpotify = await SecureStore.getItemAsync("isPremiumSpotify")

      if (isPremiumSpotify && SpotifyPlayer) {
        global.isSpotifyActivated = true
        console.log('enabled')

        await SpotifyPlayer.start()

        let isPremium = await SpotifyPlayer.isPremium()

        if (isPremium) {

          // enable premium in cards
          SpotifyPlayer.subscribe()


          // alert('Done :)')
        } else {

          // alert('Sorry, you are not a premium user :(')
        }
      }
    }

  }



  addNotification = async (username, type, payload) => {
    let prevNotifications = this.state.notifications;
    //const indexToRemove
    let obj = {
      username,
      type,
      key: this.notificationCount,
    }

    if (type === 'liked') {
      obj._handleOnTap = () => {

        global.eventEmitter.emit('openPost', payload)
      }
    } else if (type === 'messaged') {
      obj._handleOnTap = () => {

        global.eventEmitter.emit('openChat', username, payload)
      }

    }

    else if (type === 'added') {
      obj._handleOnTap = () => {

        global.eventEmitter.emit('openExternalAccount', username)
      }
    } else if (type === 'commented') {
      // Remove it if its already there
      let usernameLocal = await SecureStore.getItemAsync('username')
      if (usernameLocal && usernameLocal === username) {
        return
      }
      obj._handleOnTap = () => {

        global.eventEmitter
          .emit('openComments', payload.post._id, payload.post.description, payload.post.username, payload.comment)
      }
    }
    this.setState({
      notifications: prevNotifications.concat([obj])
    }, () => {
      this.notificationCount++;

    })
  }
  removeNotificationFromState = (key) => {
    // console.log(key)
    return true;

  }

  componentWillMount() {
    global.eventEmitter = eventEmitter;
  }



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#211F1F'
  },
  containerTwo: {
    flex: 1,
    backgroundColor: '#211F1F',
    position: 'absolute',
    top: 0,
    left: 0
  }
})



