var React = require('react');
var { View, Text, PixelRatio } = require('react-native')
import DatePicker from 'react-native-datepicker';
var WidgetMixin = require('../mixins/WidgetMixin.js');


module.exports = React.createClass({
  mixins: [WidgetMixin],
  
  getDefaultProps() {
    return {
      type: 'DatePickerIOSWidget',
      getDefaultDate: () => { return new Date(); }
    };
  },
  
  getInitialState() {
    return {
      value: new Date(),
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
  componentDidMount() {
    this._onChange(this.props.getDefaultDate());
  },
  
  render() {
    return (
      <View style={this.getStyle(['rowContainer'])}>
          <View style={this.getStyle(['row'])}>
            {this._renderImage()}
            {this._renderTitle()}
            <DatePicker
              style={this.getStyle('picker')}
              date={this.state.value}
              //mode="datetime"
              {...this.props}
              format="YYYY-MM-DD HH:mm"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              onDateChange={this._onChange}
            />
          </View>
          {this._renderValidationError()}
          {this._renderUnderline()}
      </View>
    );
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
