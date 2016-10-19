import React from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableHighlight,
  Navigator,
  Image,
  TouchableOpacity,
  PixelRatio,
} from 'react-native';

var WidgetMixin = require('../mixins/WidgetMixin');
var ValidationErrorWidget = require('./ValidationErrorWidget');

var GiftedFormManager = require('../GiftedFormManager');
var TimerMixin = require('react-timer-mixin');

var moment = require('moment');
var {height, width} = Dimensions.get('window');

module.exports = React.createClass({
  mixins: [TimerMixin, WidgetMixin],

  getDefaultProps() {
    return {
      type: 'ModalWidget',
      scrollEnabled: true,
      disclosure: true,
      cancelable: false,
      displayValue: '',
    };
  },

  propTypes: {
    type: React.PropTypes.string,
    scrollEnabled: React.PropTypes.bool,
    disclosure: React.PropTypes.bool,
    cancelable: React.PropTypes.bool,
    displayValue: React.PropTypes.string,
  },

  getInitialState() {
    return {
      // @todo
      // should be an object with all status
      // childrenAreValid: {},
    };
  },

  renderDisclosure() {
    if (this.props.disclosure === true) {
      return (
        <Image
          style={this.getStyle('disclosure')}
          resizeMode={Image.resizeMode.contain}
          source={require('../icons/disclosure.png')}
        />
      );
    }
    return null;
  },

  onPress() {

    // title={this.props.title} // @todo working  ?
    var _self = this;

    var {
      GiftedFormModal
    } = require('../GiftedForm.js');


    var route = {
      renderScene(navigator) {
        // not passing onFocus/onBlur of the current scene to the new scene
        var {onFocus, onBlur, ...others} = _self.props;

        return (
          <View style={{flex:1}}>
              <View style={{height:40,flexDirection:'row',}}>
                  <View style={{flex:1,}}/>
                  <TouchableOpacity
                      onPress={() => {
                        _self.requestAnimationFrame(() => {
                          _self.onClose(null, navigator);
                        });
                      }}
                  >
                    <Image
                      style={{ width: 24, marginTop:10, marginRight:20, tintColor: '#09b881', }}
                      resizeMode={Image.resizeMode.contain}
                      source={require('../icons/check.png')}
                    />
                  </TouchableOpacity>
              </View>
              <View style={{padding:10,}}>
                  <GiftedFormModal
                      {...others}
                      navigator={navigator}
                      isModal={true}
                      children={_self._childrenWithProps}
                  />
              </View>
          </View>
        );
      },
      getTitle() {
        return _self.props.title || '';
      },
      configureScene() {
        var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
        // disable pop gesture
        sceneConfig.gestures = {};
        return sceneConfig;
      },
      renderLeftButton(navigator) {
        if (_self.props.cancelable === true) {
          return (
            <TouchableOpacity
              onPress={() => {
                _self.requestAnimationFrame(() => {
                  _self.onClose(null, navigator);
                });
              }}
            >
              <Image
                style={{
                  width: 21,
                  marginLeft: 10,
                  tintColor: '#097881',
                }}
                resizeMode={Image.resizeMode.contain}
                source={require('../icons/close.png')}
              />
            </TouchableOpacity>
          );
        }
        return null;
      },
      renderRightButton(navigator) {
        // @todo other solution than onBack ? maybe do something automatically when scene get focus
        // @todo move button style to themes
        return (
          <TouchableOpacity
            onPress={() => {
              _self.requestAnimationFrame(() => {
                _self.onClose(null, navigator);
              });
            }}
          >
            <Image
              style={{
                width: 21,
                marginRight: 10,
                tintColor: '#097881',
              }}
              resizeMode={Image.resizeMode.contain}
              source={require('../icons/check.png')}
            />
          </TouchableOpacity>
        );
      },
    };

    // console.log('this.props.openModal from modal widget');
    // console.log(typeof this.props.openModal);

    if (this.props.openModal === null) {
      console.warn('GiftedForm: openModal prop is missing in GiftedForm component');
    } else {
      this.props.openModal(route);
    }
  },

  componentWillMount() {
    this.updateChildren(this.props.children)
  },
  componentWillReceiveProps(nextProps){
    this.updateChildren(nextProps.children)
  },
  updateChildren(children){
    this._childrenWithProps = React.Children.map(children, (child) => {
      return React.cloneElement(child, {
        formStyles: this.props.formStyles,
        openModal: this.props.openModal,
        formName: this.props.formName,
        navigator: this.props.navigator,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        onValidation: this.props.onValidation,
        onValueChange: this.props.onValueChange,

        onClose: this.onClose,
      });
    });
  },
  componentDidMount() {
    //alert('allValues:'+JSON.stringify(GiftedFormManager.getValues(this.props.formName)))
    this.setState({
      display: this.props.display,
      value: this.props.value,
    });
  },

  onClose(value, navigator = null) {
    //alert('ModalWidget.onClose.value='+value+'  type:'+typeof value+'  displayValue='+this._getDisplayableValue())
    if (typeof value === 'string') { //for select
      //alert('ModalWidget.onClose.value='+value+'  type:'+typeof value)
      this.setState({
        value: value,
        display: value,
      });
    } else { //for textarea
      let value1 = GiftedFormManager.getValue(this.props.formName, this.props.name)
      //alert('ModalWidget.onClose()store.value='+value1+'  type:'+typeof value1)
      this.setState({
        display: value1,
        value: value1,
      });
    }

    if (navigator !== null) {
      navigator.pop();
    }
  },

  refreshDisplayableValue() {
    this.setState({
      value: this._getDisplayableValue(),
    });
  },
  _getDisplayableValue() {
    //alert(this.props.displayValue+':'+JSON.stringify(GiftedFormManager.getValues(this.props.formName)))
    if (this.props.displayValue !== '') {
      if (typeof GiftedFormManager.stores[this.props.formName] !== 'undefined') {
        if (typeof GiftedFormManager.stores[this.props.formName].values !== 'undefined') {
          if (typeof GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] !== 'undefined') {
            //console.log('if.form.'+this.props.displayValue+'='+GiftedFormManager.stores[this.props.formName].values[this.props.displayValue])
            if (typeof this.props.transformValue === 'function') {
              return this.props.transformValue(GiftedFormManager.stores[this.props.formName].values[this.props.displayValue]);
            } else if (GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] instanceof Date) {
              return moment(GiftedFormManager.stores[this.props.formName].values[this.props.displayValue]).calendar(null, {
                sameDay: '[Today]',
                nextDay: '[Tomorrow]',
                nextWeek: 'dddd',
                lastDay: '[Yesterday]',
                lastWeek: '[Last] dddd'
              });
            }
            if (typeof GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] === 'string') {
              let display = GiftedFormManager.stores[this.props.formName].values[this.props.displayValue].trim()
              //console.log('form.textarea:'+this.props.displayValue+'='+display)  //text area
              //alert('form.textarea:'+display)
              return display;
            }
          } else {
            // @todo merge with when not select menu

            // when values[this.props.displayValue] is not found
            // probably because it's a select menu
            // options of select menus are stored using the syntax name{value}, name{value}
            var values = GiftedFormManager.getValues(this.props.formName);
            //console.log('else------form.'+this.props.displayValue+'='+JSON.stringify(values))
            //alert(JSON.stringify(GiftedFormManager.getValues(this.props.formName)))
            if (typeof values === 'object') {
              if (typeof values[this.props.displayValue] !== 'undefined') {
                if (typeof this.props.transformValue === 'function') {
                  return this.props.transformValue(values[this.props.displayValue]);
                } else {
                  if (Array.isArray(values[this.props.displayValue])) {
                    // @todo
                    // should return the title and not the value in case of select menu
                    return values[this.props.displayValue].join(', ');
                  } else if (values[this.props.displayValue] instanceof Date) {
                    return moment(values[this.props.displayValue]).calendar(null, {
                      sameDay: '[Today]',
                      nextDay: '[Tomorrow]',
                      nextWeek: 'dddd',
                      lastDay: '[Yesterday]',
                      lastWeek: '[Last] dddd'
                    });
                  } else {
                    return values[this.props.displayValue];
                  }
                }
              }
            }
          }
        }
      }
    }
    return '';
  },
  render() {
    //console.log('modal.'+this.props.title+'.value:'+this.state.value)
    return (
      <TouchableHighlight
        onPress={() => {
          this.requestAnimationFrame(() => {
            this.onPress();
          });
        }}
        underlayColor={this.getStyle('underlayColor').pop()}

        {...this.props} // mainly for underlayColor

        style={this.getStyle('rowContainer')}
      >
      <View style={this.getStyle(['rowContainer'])}>
        <View style={this.getStyle('row')}>
          {this._renderImage()}
          <Text numberOfLines={1} style={this.getStyle('modalTitle')}>{this.props.title}</Text>
          <View style={this.getStyle('alignRight')}>
            <Text numberOfLines={1} style={this.getStyle('modalValue')}>{this.state.display}</Text>
          </View>
          {this.renderDisclosure()}
        </View>
        {this._renderValidationError()}
      </View>
      </TouchableHighlight>
    );
  },

  defaultStyles: {
    rowImage: {
      height: 20,
      width: 20,
      marginLeft: 10,
    },
    rowContainer: {
      backgroundColor: '#FFF',
      borderBottomWidth: 1 / PixelRatio.get(),
      borderColor: '#c8c7cc',
    },
    underlayColor: '#c7c7cc',
    row: {
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
    },
    disclosure: {
      // transform: [{rotate: '90deg'}],
      marginLeft: 10,
      marginRight: 10,
      width: 11,
    },
    modalTitle: {
      flex: 1,
      fontSize: 15,
      color: '#000',
      paddingLeft: 10,
    },
    alignRight: {
      alignItems: 'flex-end',
    },
    modalValue: {
      fontSize: 15,
      color: '#c7c7cc',
    },
  },
});
