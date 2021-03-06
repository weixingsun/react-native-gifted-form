import React from 'react'
import {TextInput, View, ListView, Image, Text, Dimensions, TouchableHighlight, TouchableWithoutFeedback, Platform, ActivityIndicator, PixelRatio} from 'react-native'
import Qs from 'qs'
import KKLocation from 'react-native-baidumap/KKLocation';

if (!String.prototype.appendAddr) {
    String.prototype.appendAddr = function(str){
      if(str!=='') return this+', '+str
      else return this
  };
}

const defaultStyles = {
  container: {
    flex: 1,
  },
  textInputContainer: {
    //backgroundColor: '#C9C9CE',
    //height: 44,
    //width: Style.SEARCH_WIDTH,
    //marginTop: 1,
    //marginLeft: 1,
    //marginRight: 1,
    //borderTopColor: '#7e7e7e',
    //borderBottomColor: '#b5b5b5',
    //borderTopWidth: 1 / PixelRatio.get(),
    //borderBottomWidth: 1 / PixelRatio.get(),
  },
  textInput: {
    //backgroundColor: '#FFFFFF',
    //height: 40,
    //borderRadius: 5,
    //paddingTop: 4.5,
    //paddingBottom: 1,
    //paddingLeft: 5,
    //paddingRight: 5,
    //marginTop: 2,
    //marginLeft: 2,
    //marginRight: 2,
    //fontSize: 15,
    fontSize: 15,
    flex: 1,
    height: 40,// @todo should be changed if underlined
    marginTop: 2,
  },
  poweredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  powered: {
    //marginTop: 15,
  },
  listView: {
    // flex: 1,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
    backgroundColor: 'rgba(220,220,220,0.7)', 
  },
  separator: {
    height: 1,
    backgroundColor: '#c8c7cc',
  },
  description: {
    fontSize: 12,
  },
  loader: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
  androidLoader: {
    //marginRight: -15,
  },
};

const BaiduPlaceTip = React.createClass({

  propTypes: {
    placeholder: React.PropTypes.string,
    onPress: React.PropTypes.func,
    minLength: React.PropTypes.number,
    fetchDetails: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool,
    value: React.PropTypes.string,
    timeout: React.PropTypes.number,
    onTimeout: React.PropTypes.func,
    query: React.PropTypes.object,
    GoogleReverseGeocodingQuery: React.PropTypes.object,
    GooglePlacesSearchQuery: React.PropTypes.object,
    styles: React.PropTypes.object,
    textInputProps: React.PropTypes.object,
    enablePoweredByContainer: React.PropTypes.bool,
    predefinedPlaces: React.PropTypes.array,
    currentLocation: React.PropTypes.bool,
    currentLocationLabel: React.PropTypes.string,
    nearbyPlacesAPI: React.PropTypes.string,
    filterReverseGeocodingByTypes: React.PropTypes.array,
    predefinedPlacesAlwaysVisible: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      placeholder: 'Search',
      onPress: () => {},
      minLength: 0,
      fetchDetails: false,
      autoFocus: false,
      value: '',
      timeout: 20000,
      onTimeout: () => console.warn('google places autocomplete: request timeout'),
      query: {
        key: 'missing api key',
        //language: 'en',
        //types: 'geocode',
      },
      GoogleReverseGeocodingQuery: {
      },
      GooglePlacesSearchQuery: {
        rankby: 'distance',
        types: 'food',
      },
      styles: {
      },
      textInputProps: {},
      enablePoweredByContainer: false, //true,
      predefinedPlaces: [],
      currentLocation: false,
      currentLocationLabel: '获取当前位置',
      //nearbyPlacesAPI: 'GooglePlacesSearch',
      nearbyPlacesAPI: 'BaiduPlacesSearch',
      filterReverseGeocodingByTypes: [],
      predefinedPlacesAlwaysVisible: false,
    };
  },

  getInitialState() {
    const ds = new ListView.DataSource({rowHasChanged: function rowHasChanged(r1, r2) {
      if (typeof r1.isLoading !== 'undefined') {
        return true;
      }
      return r1 !== r2;
    }});
    return {
      text: this.props.value,
      dataSource: ds.cloneWithRows(this.buildRowsFromResults([])),
      listViewDisplayed: false,
    };
  },

  buildRowsFromResults(results) {
    var res = null;
    if (results.length === 0 || this.props.predefinedPlacesAlwaysVisible === true) {
      res = [...this.props.predefinedPlaces];
      if (this.props.currentLocation === true) {
        res.unshift({
          description: this.props.currentLocationLabel,
          isCurrentLocation: true,
        });
      }
    } else {
      res = [];
    }
    
    res = res.map(function(place) {
      return {
        ...place,
        isPredefinedPlace: true,
      }
    });
    //alert('res='+JSON.stringify(res)+'\nresults='+JSON.stringify(results))
    return [...res, ...results];
  },

  componentWillUnmount() {
    this._abortRequests();
  },

  _abortRequests() {
    for (let i = 0; i < this._requests.length; i++) {
      this._requests[i].abort();
    }
    this._requests = [];
  },

  /**
   * This method is exposed to parent components to focus on textInput manually.
   * @public
   */
  triggerFocus() {
    if (this.refs.textInput) this.refs.textInput.focus();
  },

  /**   
   * This method is exposed to parent components to blur textInput manually.   
   * @public   
   */    
  triggerBlur() {
    if (this.refs.textInput) this.refs.textInput.blur();
  },   

  getCurrentLocation() {
    let self=this
    this.watchID = KKLocation.getCurrentPosition(
        (position) => {
            //{timestamp,{coords:{heading,accuracy,longitude,latitude}}}  //no speed,altitude
            self._requestNearby(position.coords.latitude, position.coords.longitude);
            //self.setState({ pos:position.coords })
            //self.turnOffGps()
            //alert(JSON.stringify(position.coords))
        },(error) => {
            this._disableRowLoaders();
        },{enableHighAccuracy: false, timeout: 10000, maximumAge: 1000, distanceFilter:100},
    );
  },

  _enableRowLoader(rowData) {
    
    let rows = this.buildRowsFromResults(this._results);    
    for (let i = 0; i < rows.length; i++) {
      if ((rows[i].place_id === rowData.place_id) || (rows[i].isCurrentLocation === true && rowData.isCurrentLocation === true)) {
        rows[i].isLoading = true;
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(rows),
        });
        break;
      }
    }
  },
  _disableRowLoaders() {
    if (this.isMounted()) {
      for (let i = 0; i < this._results.length; i++) {
        if (this._results[i].isLoading === true) {
          this._results[i].isLoading = false;
        }
      }
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults(this._results)),
      });
    }
  },
  _onPress(rowData) {
    //alert('isCurr='+rowData.isCurrentLocation+' gotCurr='+rowData.gotCurrentLocation+'\ndata='+JSON.stringify(rowData))
    if (rowData.isPredefinedPlace !== true && this.props.fetchDetails === true) {
      // fetch details
    } else if (rowData.isCurrentLocation === true && rowData.gotCurrentLocation !== true) {
      this._enableRowLoader(rowData);
      this.triggerBlur(); // hide keyboard but not the results
      //this._onBlur();
      this.getCurrentLocation();
      delete rowData.isLoading;
    } else {
      //alert('>>>>>>>>>>>>>>>>>>>Yes, Baidu/Gaode use this branch<<<<<<<<<<<<<<<<<<')
      this.setState({
        text: rowData.description,
      });
      this._onBlur();
      delete rowData.isLoading;
      //let predefinedPlace = this._getPredefinedPlace(rowData);
      this.props.onPress(rowData, null);
    }
  },
  _results: [],
  _requests: [],
  
  _getPredefinedPlace(rowData) {
    //alert(JSON.stringify(rowData))
    if (rowData.isPredefinedPlace !== true) {
      return rowData;
    }
    for (let i = 0; i < this.props.predefinedPlaces.length; i++) {
      if (this.props.predefinedPlaces[i].description === rowData.description) {
        return this.props.predefinedPlaces[i];
      }
    }
    return rowData;
  },
  
  _filterResultsByTypes(responseJSON, types) {
    if (types.length === 0) return responseJSON.results;
    
    var results = [];
    for (let i = 0; i < responseJSON.results.length; i++) {
      let found = false;
      for (let j = 0; j < types.length; j++) {
        if (responseJSON.results[i].types.indexOf(types[j]) !== -1) {
          found = true;
          break;
        }
      }
      if (found === true) {
        results.push(responseJSON.results[i]);
      }
    }
    return results;
  },
  
  
  _requestNearby(latitude, longitude) {
    this._abortRequests();
    //alert('_requestNearby() '+latitude+','+ longitude)
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      const request = new XMLHttpRequest();
      this._requests.push(request);
      request.timeout = this.props.timeout;
      request.ontimeout = this.props.onTimeout;
      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          //alert(request.responseText)
          const responseJSON = JSON.parse(request.responseText);
          this._disableRowLoaders();
          if (responseJSON.result&&this.isMounted()) {
              responseJSON.result['gotCurrentLocation']=true
              responseJSON.result['isCurrentLocation']=true
              let results = [responseJSON.result];
              //alert('result='+JSON.stringify(results))
              this.setState({
                  dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults(results)),
              });
              /*this.setState({
                  text: rowData.description,
              });
              //this._onBlur();
              //delete rowData.isLoading;
              this.props.onPress(rowData, null);*/
              //if(this.props.onClose) this.props.onClose({lat:details.geometry.location.lat,lng:details.geometry.location.lng,type:details.types})
          }
          if (typeof responseJSON.error_message !== 'undefined') {
            console.warn('google places autocomplete: ' + responseJSON.error_message);
          }
        } else {
          // console.warn("google places autocomplete: request could not be completed or has been aborted");
        }
      };
      let url = 'http://api.map.baidu.com/geocoder/v2/?output=json'+
                  '&mcode='+this.props.query.mcode+
                  '&ak=' + this.props.query.ak+
                  '&location='+latitude+','+longitude
      //alert('url='+url)
      request.open('GET', url);
      request.send();
    } else {
      this._results = [];
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults([])),
      });
    }
  },

  
  
  
  _request(text) {
    this._abortRequests();
    if (text.length >= this.props.minLength) {
      const request = new XMLHttpRequest();
      this._requests.push(request);
      request.timeout = this.props.timeout;
      request.ontimeout = this.props.onTimeout;
      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          //let json = JSON.parse(request.responseText)
          this._results = JSON.parse(request.responseText).result
          //else if(request._response) this._results = JSON.parse(request._response).result;
          //alert(JSON.stringify(this._results))
          if (this._results && this.isMounted()) {
             this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults(this._results)),
             });
          }
          //responseJSON.error_message
        } else {
          // console.warn("google places autocomplete: request could not be completed or has been aborted");
          //alert('err status='+request.status)
        }
      };
      //let location_str = 'location='+this.props.query.location    //location broken on 2016-10-28
      let location_str = '&region=全国'
      var url='http://api.map.baidu.com/place/v2/suggestion?output=json'+location_str+'&mcode=' +this.props.query.mcode +'&q=' +encodeURI(text) +'&ak='+this.props.query.ak;
      //console.log('url='+url)
      request.open('GET', url);
      request.send();
    } else {
      this._results = [];
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults([])),
      });
    }
  },
  _onChangeText(text) {
    this._request(text);
    this.setState({
      text: text,
      listViewDisplayed: true,
    });
  },
  
  _getRowLoader() {
    /*if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          style={[defaultStyles.androidLoader, this.props.styles.androidLoader]}
          styleAttr="Inverse"
        />
      );
    }*/
    return (
      <ActivityIndicator
        animating={true}
        size="small"
      />
    );
  },
  
  _renderLoader(rowData) {
    if (rowData.isLoading === true) {
      return (
        <View
          style={[defaultStyles.loader, this.props.styles.loader]}
        >
          {this._getRowLoader()}
        </View>      
      );      
    }
    return null;
  },
  _renderRow(rowData = {}) {
    //alert('got='+rowData.gotCurrentLocation+'  is='+rowData.isCurrentLocation)
    if(typeof rowData.isCurrentLocation === 'undefined') {
      rowData.description = rowData.name +', '+rowData.district+', '+ rowData.city //+', '+rowData.province +', '+rowData.country ;
    }else if(typeof rowData.gotCurrentLocation !== 'undefined'){
      //alert(JSON.stringify(rowData))
      let near = '附近'
      let addr = rowData.addressComponent
      if(addr.street_number!=='')
        rowData.description = addr.street_number.appendAddr(addr.street).appendAddr(addr.district).appendAddr(addr.city) //+', '+rowData.country ;
      else if(addr.street!=='')
        rowData.description = near.appendAddr(addr.street).appendAddr(addr.district).appendAddr(addr.city)
      else if(addr.district!=='')
        rowData.description = near.appendAddr(addr.district).appendAddr(addr.city).appendAddr(addr.country)
      else if(addr.city!=='')
        rowData.description = near.appendAddr(addr.city).appendAddr(addr.country)
    }
    return (
      <TouchableHighlight
        onPress={() =>
          this._onPress(rowData)
        }
        underlayColor="#c8c7cc"
      >
        <View>
          <View style={[defaultStyles.row, this.props.styles.row, rowData.isPredefinedPlace ? this.props.styles.specialItemRow : {}]}>
            <Text
              style={[{flex: 1}, defaultStyles.description, this.props.styles.description, rowData.isPredefinedPlace ? this.props.styles.predefinedPlacesDescription : {}]}
              numberOfLines={1}
            >
              {rowData.description}
            </Text>
            {this._renderLoader(rowData)}
          </View>
          <View style={[defaultStyles.separator, this.props.styles.separator]} />
        </View>
      </TouchableHighlight>
    );
  },

  _onBlur() {
    this.triggerBlur();
    this.setState({listViewDisplayed: false});
  },

  _onFocus() {
    this.setState({listViewDisplayed: true});
  },

  _getListView() {
    if ((this.state.text !== '' || this.props.predefinedPlaces.length || this.props.currentLocation === true) && this.state.listViewDisplayed === true) {
      return (
        <ListView
          keyboardShouldPersistTaps={true}
          keyboardDismissMode="on-drag"
          style={[defaultStyles.listView, this.props.styles.listView]}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          {...this.props}
        />
      );
    }

    if(this.props.enablePoweredByContainer) {
      return (
        <View
          style={[defaultStyles.poweredContainer, this.props.styles.poweredContainer]}
        >
          <Image
            style={[defaultStyles.powered, this.props.styles.powered]}
            resizeMode={Image.resizeMode.contain}
            //source={require('./images/powered_by_google_on_white.png')}
          />
        </View>
      );
    }

    return null;
  },
  render() {
    let { onChangeText, onFocus, ...userProps } = this.props.textInputProps;
    return (
      <View
        style={[defaultStyles.container, this.props.styles.container]}
      >
        <View
          style={[defaultStyles.textInputContainer, this.props.styles.textInputContainer]}
        >
          <TextInput
            { ...userProps }
            ref="textInput"
            autoFocus={this.props.autoFocus}
            style={[defaultStyles.textInput, this.props.styles.textInput]}
            onChangeText={onChangeText ? text => {this._onChangeText(text); onChangeText(text)} : this._onChangeText}
            value={this.state.text}
            placeholder={this.props.placeholder}
            onFocus={onFocus ? () => {this._onFocus(); onFocus()} : this._onFocus}
            clearButtonMode="while-editing"
          />
        </View>
        {this._getListView()}
      </View>
    );
  },
});


const create = function create(options = {}) {
  return React.createClass({
    render() {
      return (
        <GaodePlaceTip ref="GaodePlaceTip"
          {...options}
        />
      );
    },
  });
};


module.exports = BaiduPlaceTip; //{BaiduPlaceTip, create};
