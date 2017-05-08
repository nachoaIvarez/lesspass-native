import './shim';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Button,
  Clipboard,
  StatusBar,
  Keyboard,
  Platform,
  Vibration,
} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {generatePassword} from 'lesspass';
import {DEFAULT_PROFILE, getFingerprintSettings} from './utils';

const APP_COLOR = '#3398EB';
const DISTANCE = 25;
const HEIGHT = 45;

export default class App extends React.Component {
  state = {
    site: null,
    login: null,
    masterPassword: null,
    icon1: null,
    icon2: null,
    icon3: null,
    color1: null,
    color2: null,
    color3: null,
    fingerprintReady: false,
    generatingPassword: false,
    passwordReady: false,
  };

  constructor(props) {
    super(props);
    this.generatePassword = this.generatePassword.bind(this);
    this.handleMasterPasswordChange = this.handleMasterPasswordChange.bind(
      this,
    );
  }

  async generatePassword() {
    this.setState({generatingPassword: true});
    const {site, login, masterPassword} = this.state;
    const generatedPassword = await generatePassword(
      site,
      login,
      masterPassword,
      DEFAULT_PROFILE,
    );
    this.setState({passwordReady: true, generatingPassword: false});
    Clipboard.setString(generatedPassword);
    Vibration.vibrate();
  }

  async handleMasterPasswordChange(value) {
    this.setState({
      masterPassword: value || null,
      passwordReady: false,
      fingerprintReady: false,
    });
    if (!!value) {
      const newFingerprintSettings = await getFingerprintSettings(value);
      this.setState({
        ...newFingerprintSettings,
        fingerprintReady: true,
      });
    }
  }

  getButtonLabel = () => {
    if (this.state.passwordReady) return 'Password copied to clipboard';
    if (this.state.generatingPassword) return 'Generating Password';
    return 'Generate Password';
  };

  getButtonDisabled = () =>
    this.state.passwordReady ||
    this.state.generatingPassword ||
    (!this.state.site || !this.state.login || !this.state.masterPassword);

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.appContainer}
        behavior="padding"
        onPress={Keyboard.dismiss}
      >
        <View style={styles.formContainer}>
          <StatusBar barStyle="light-content" />
          <View style={styles.inputContainer}>
            <TextInput
              onChangeText={value =>
                this.setState({site: value || null, passwordReady: false})}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={'Site'}
              style={[styles.border, styles.input]}
              value={this.state.site}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              onChangeText={value =>
                this.setState({login: value || null, passwordReady: false})}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={'Login'}
              style={[styles.border, styles.input]}
              value={this.state.login}
            />
          </View>
          <View style={[styles.border, styles.row, styles.inputContainer]}>
            <TextInput
              secureTextEntry
              onChangeText={this.handleMasterPasswordChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={'Master Password'}
              style={[styles.input, {flex: 1}]}
              value={this.state.masterPassword}
            />
            {this.state.fingerprintReady &&
              <View style={[styles.row, styles.input]}>
                <FontAwesome
                  name={this.state.icon1 || null}
                  color={this.state.color1 || null}
                  size={20}
                />
                <FontAwesome
                  name={this.state.icon2 || null}
                  color={this.state.color2 || null}
                  style={{marginLeft: 10}}
                  size={20}
                />
                <FontAwesome
                  name={this.state.icon3 || null}
                  color={this.state.color3 || null}
                  style={{marginLeft: 10}}
                  size={20}
                />
              </View>}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              color={APP_COLOR}
              onPress={this.generatePassword}
              title={this.getButtonLabel()}
              accessibilityLabel={this.getButtonLabel()}
              disabled={this.getButtonDisabled()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: APP_COLOR,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: DISTANCE,
  },
  formContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: DISTANCE,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {height: 3},
    shadowRadius: 6,
  },
  input: {
    height: HEIGHT,
    padding: DISTANCE / 3,
  },
  inputContainer: {
    marginVertical: DISTANCE / 2,
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
    borderBottomColor: APP_COLOR,
  },
  buttonContainer: {
    marginTop: DISTANCE / 2,
    // marginBottom: DISTANCE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
