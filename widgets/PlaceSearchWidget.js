var React = require('react');
var {Text,View,PixelRatio} = require('react-native');

var WidgetMixin = require('../mixins/WidgetMixin.js');
var ValidationErrorWidget = require('./ValidationErrorWidget');

var GooglePlaceTip = require('./GooglePlaceTip');
var BaiduPlaceTip  = require('./BaiduPlaceTip');

module.exports = React.createClass({
  mixins: [WidgetMixin],
  propTypes: {
    placeholder:  React.PropTypes.string,
    fetchDetails: React.PropTypes.bool,
    value:        React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      value: '',
      type: 'PlaceSearchWidget',
    };
  },
  _renderTitle() {
    if (this.props.title !== '') {
      return (
        <Text
          numberOfLines={1}
          style={this.getStyle(['textInputTitleInline'])}
        >
          {this.props.title}
        </Text>
      );
    }
    return (
      <View style={this.getStyle(['spacer'])}/>
    );
  },  
  _renderUnderline() {
    if (this.props.underlined === true) {
      if (this.state.focused === false) {
        return (
          <View
            style={this.getStyle(['underline', 'underlineIdle'])}
          />
        );
      }
      return (
        <View
          style={this.getStyle(['underline', 'underlineFocused'])}
        />
      );
    }
    return null;
  },

  /*onFocus() {
    this.setState({
      focused: true,
    });
    this.props.onFocus();
    let oldText = this.state.value;
    let newText = this.props.onTextInputFocus(this.state.value);
    if (newText !== oldText) {
      this._onChange(newText);
    }
  },

  onBlur() {
    this.setState({
      focused: false,
    });
    this.props.onBlur();
    this.props.onTextInputBlur(this.state.value);
  },*/
  _renderRow() {
    /*if (this.props.inline === false) {
      return (
        <View style={this.getStyle(['rowContainer'])}>
          <View style={this.getStyle(['titleContainer'])}>
            {this._renderImage()}
            <Text numberOfLines={1} style={this.getStyle(['textInputTitle'])}>{this.props.title}</Text>
          </View>

          {this.renderMaps()}
          {this._renderValidationError()}
          {this._renderUnderline()}
        </View>
      );
    } //this.getStyle(['textInputInline'])  //value={this.state.value}  //{this._renderValidationError()}
    //{this._renderImage()}
    style={this.getStyle(['row'])}
    */
    return (
      <View style={this.getStyle(['rowContainer'])}>
        <View style={{flexDirection: 'row',alignItems: 'center',}}>
          {this._renderImage()}
          {this._renderTitle()}
          {this.renderMaps()}
          {this._renderUnderline()}
        </View>
          {this._renderValidationError()}
      </View>
    );

  },
  renderValidationError(){
    if(this.props.validationResults == null) return null
    else if(this.props.validationResults[this.props.name]==null) return null
    else if(this.props.validationResults[this.props.name][0].isValid) return null
    else{
      //console.log('validationResults='+JSON.stringify(this.props.validationResults[this.props.name])+'\nname='+this.props.name)
      return (
        <ValidationErrorWidget
          {...this.props}
          message={this.props.validationResults[this.props.name][0].message}
        />
      )
    }
  },
  renderGoogle() {
    //const everywhere = {description: 'Everywhere', geometry: { location: { lat: 0, lng: 0 } }};
    return (
      <GooglePlaceTip
        placeholder='powered by Google'
        minLength={2} // minimum length of text to search
        autoFocus={false}
        fetchDetails={true}
        onPress={(data, details = {}) => { // details is provided when fetchDetails = true
          this._onChange( details.formatted_address );
          this.props.onClose({lat:details.geometry.location.lat,lng:details.geometry.location.lng,type:details.types});
        }}
        value={ this.props.value }
        query={this.props.query}
        styles={{
          description: {
            //fontWeight: 'bold',
            fontSize:12,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        //onClose={this.props.onClose}
        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
        //currentLocationLabel="Current location"
        //currentLocationAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        //GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        //}}
        //GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          // rankby: 'distance',
          //types: 'food',
        //}}
        //filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        // predefinedPlaces={[everywhere]}
        {...this.props} // @todo test sans (need for 'name')
      />
    );
  },

  renderBaidu(){
    //const everywhere = {description: 'Everywhere', geometry: { location: { lat: 0, lng: 0 } }};
    //alert('default='+this.props.value)
    return (
      <BaiduPlaceTip
        placeholder='powered by Baidu'
        minLength={2} // minimum length of text to search
        autoFocus={false}
        fetchDetails={true}
        onPress={(data, details = {}) => { // details is provided when fetchDetails = true
          this._onChange( data.description )
          this.props.onClose({lat:data.location.lat,lng:data.location.lng}, this.props.navigator);
        }}
        value={ this.props.value }
        query={this.props.query}
        styles={{
          description: {
            //fontWeight: 'bold',
            fontSize:12,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        currentLocation={true}
        {...this.props} // @todo test sans (need for 'name')
      />
    );
  },
  renderMaps(){
      switch(this.props.map) {
          case 'GoogleMap':
              return this.renderGoogle()
              break;
          case 'BaiduMap':
              return this.renderBaidu()
              break;
          case 'GaodeMap':
              return this.renderGaode()
              break;
          default:
              return null;
      }
  },
  render(){
      return this._renderRow() 
      //return this.renderMaps()
  },
  defaultStyles: {
    rowImage: {
      height: 20,
      width: 20,
      marginLeft: 10,
    },
    underline: {
      marginRight: 10,
      marginLeft: 10,
    },
    underlineIdle: {
      borderBottomWidth: 2,
      borderColor: '#c8c7cc',
    },
    underlineFocused: {
      borderBottomWidth: 2,
      borderColor: '#3498db',
    },
    spacer: {
      width: 10,
    },
    rowContainer: {
      backgroundColor: '#FFF',
      borderBottomWidth: 1 / PixelRatio.get(),
      borderColor: '#c8c7cc',
    },
    row: {
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
    },
    titleContainer: {
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      // selfAlign: 'center',
      // backgroundColor: '#ff0000',
    },
    textInputInline: {
      fontSize: 15,
      flex: 1,
      height: 40,// @todo should be changed if underlined
      marginTop: 2,
    },
    textInputTitleInline: {
      width: 80,
      fontSize: 15,
      color: '#000',
      paddingLeft: 10,
    },
    textInputTitle: {
      fontSize: 13,
      color: '#333',
      paddingLeft: 10,
      flex: 1
    },
    textInput: {
      fontSize: 15,
      flex: 1,
      height: 40,
      marginLeft: 20,
    },
  },
});
