var React = require('react');
var {
  Dimensions,
  View,
  TextInput,
  PixelRatio
} = require('react-native')
var {height, width} = Dimensions.get('window');
var WidgetMixin = require('../mixins/WidgetMixin.js');


module.exports = React.createClass({
  mixins: [WidgetMixin],
  
  getDefaultProps() {
    return {
      type: 'TextAreaWidget',
    };
  },
  
  render() {
    return (
      <View style={this.getStyle('textAreaRow')}>
        <TextInput
          style={this.getStyle('textArea')}
          multiline={true}

          {...this.props}
          
          onFocus={() => this.props.onFocus(true)}
          onChangeText={this._onChange}
          value={this.state.value}
        />
      </View>
    );
  },
  
  defaultStyles: {
    textAreaRow: {
      backgroundColor: '#FFF',
      height: height*2/3,
      borderBottomWidth: 1 / PixelRatio.get(),
      borderColor: '#c8c7cc',
      //alignItems: 'center',
      //paddingLeft: 10,
      //paddingRight: 10,
    },
    textArea: {
      flex: 1,
      fontSize: 15,
      padding:15,
    },
  },
  
});
