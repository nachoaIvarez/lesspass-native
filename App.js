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
  Image,
  Switch,
  Picker,
} from 'react-native';
import SideMenu from 'react-native-side-menu';
import { Font, AppLoading } from 'expo';
import { FontAwesome } from '@expo/vector-icons';
import { generatePassword } from 'lesspass';
import { DEFAULT_PROFILE, getFingerprintSettings } from './utils';
import logo from './logo.png';
import menlo from './menlo.ttf';

const { Item: PickerItem } = Picker;

const MIN_LENGTH = 5;
const MAX_LENGTH = 36;
const MAX_COUNTER = 1000;
const APP_COLOR = '#3398EB';
const DISTANCE = 20;
const HEIGHT = 40;

const Menu = ({ lowercase, uppercase, numbers, symbols, length, counter, update }) => (
  <View style={styles.settings}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.setting}>
      <Text style={styles.settingText}>a-z</Text>
      <Switch
        thumbTintColor={Platform.OS === 'android' ? 'white' : undefined}
        onTintColor={APP_COLOR}
        onValueChange={value => update({ lowercase: value })}
        value={lowercase}
      />
    </View>
    <View style={styles.setting}>
      <Text style={styles.settingText}>A-Z</Text>
      <Switch
        thumbTintColor={Platform.OS === 'android' ? 'white' : undefined}
        onTintColor={APP_COLOR}
        onValueChange={value => update({ uppercase: value })}
        value={uppercase}
      />
    </View>
    <View style={styles.setting}>
      <Text style={styles.settingText}>0-9</Text>
      <Switch
        thumbTintColor={Platform.OS === 'android' ? 'white' : undefined}
        onTintColor={APP_COLOR}
        onValueChange={value => update({ numbers: value })}
        value={numbers}
      />
    </View>
    <View style={styles.setting}>
      <Text style={styles.settingText}>%!@</Text>
      <Switch
        thumbTintColor={Platform.OS === 'android' ? 'white' : undefined}
        onTintColor={APP_COLOR}
        onValueChange={value => update({ symbols: value })}
        value={symbols}
      />
    </View>
    <View style={styles.pickersContainer}>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Length</Text>
        <Picker
          style={styles.picker}
          selectedValue={length}
          onValueChange={value => update({ length: value })}
        >
          {[...Array(MAX_LENGTH - MIN_LENGTH).keys()].map(value => (
            <PickerItem
              key={`length${value}`}
              label={`${value + MIN_LENGTH}`}
              value={value + MIN_LENGTH}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Counter</Text>
        <Picker
          style={styles.picker}
          selectedValue={counter}
          onValueChange={value => update({ counter: value })}
        >
          {[...Array(MAX_COUNTER).keys()].map(value => (
            <PickerItem key={`counter${value}`} label={`${value + 1}`} value={value + 1} />
          ))}
        </Picker>
      </View>
    </View>
  </View>
);

export default class App extends React.Component {
  state = {
    site: null,
    login: null,
    masterPassword: null,
    fingerprintReady: false,
    generatingPassword: false,
    passwordReady: false,
    fingerprint: {
      icon1: null,
      icon2: null,
      icon3: null,
      color1: null,
      color2: null,
      color3: null,
    },
    profile: {
      ...DEFAULT_PROFILE,
    },
    fontReady: false,
  };

  constructor(props) {
    super(props);
    this.generatePassword = this.generatePassword.bind(this);
    this.handleMasterPasswordChange = this.handleMasterPasswordChange.bind(this);
  }

  async componentDidMount() {
    await Font.loadAsync('mono', menlo);
    this.setState({ fontReady: true });
  }

  async generatePassword() {
    this.setState({ generatingPassword: true });
    const { site, login, masterPassword, profile } = this.state;
    const generatedPassword = await generatePassword(site, login, masterPassword, profile);
    this.setState({ passwordReady: true, generatingPassword: false });
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
      const fingerprint = await getFingerprintSettings(value);
      this.setState({
        fingerprint,
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
    const menu = (
      <Menu
        update={change => this.setState({ profile: { ...this.state.profile, ...change } })}
        {...this.state.profile}
      />
    );

    return !this.state.fontReady
      ? <AppLoading />
      : <SideMenu menu={menu} autoClosing={false}>
          <KeyboardAvoidingView
            style={styles.appContainer}
            behavior="padding"
            onPress={Keyboard.dismiss}
          >
            <View style={styles.title}>
              <Image source={logo} style={styles.logo} />
              <Text style={styles.titleText}>LessPass</Text>
            </View>
            <View style={styles.formContainer}>
              <StatusBar barStyle="light-content" />
              <View style={styles.inputContainer}>
                <TextInput
                  underlineColorAndroid={APP_COLOR}
                  onChangeText={value =>
                    this.setState({ site: value || null, passwordReady: false })}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={'Site'}
                  style={[styles.border, styles.input]}
                  value={this.state.site}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  underlineColorAndroid={APP_COLOR}
                  onChangeText={value =>
                    this.setState({ login: value || null, passwordReady: false })}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={'Login'}
                  style={[styles.border, styles.input]}
                  value={this.state.login}
                />
              </View>
              <View style={[styles.border, styles.row, styles.inputContainer]}>
                <TextInput
                  underlineColorAndroid={APP_COLOR}
                  secureTextEntry
                  onChangeText={this.handleMasterPasswordChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={'Master Password'}
                  style={[styles.input, { flex: 1 }]}
                  value={this.state.masterPassword}
                />
                {this.state.fingerprintReady &&
                  <View style={[styles.row, styles.input]}>
                    <FontAwesome
                      name={this.state.fingerprint.icon1 || null}
                      color={this.state.fingerprint.color1 || null}
                      size={20}
                    />
                    <FontAwesome
                      name={this.state.fingerprint.icon2 || null}
                      color={this.state.fingerprint.color2 || null}
                      style={{ marginLeft: 10 }}
                      size={20}
                    />
                    <FontAwesome
                      name={this.state.fingerprint.icon3 || null}
                      color={this.state.fingerprint.color3 || null}
                      style={{ marginLeft: 10 }}
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
        </SideMenu>;
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
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { height: 3 },
    shadowRadius: 3,
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
    shadowOffset: { height: 3 },
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    alignSelf: 'center',
    marginBottom: DISTANCE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 66,
    width: 66,
    marginRight: DISTANCE / 2,
  },
  titleText: {
    fontSize: 33,
    color: 'white',
  },
  settings: {
    justifyContent: 'center',
    alignItems: 'stretch',
    flex: 1,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: DISTANCE / 2,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  settingText: {
    marginLeft: DISTANCE / 4,
    fontSize: 20,
    fontFamily: 'mono',
    color: '#333',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  picker: {
    width: 80,
  },
  pickerContainer: {
    marginTop: DISTANCE,
    alignItems: 'center',
  },
});
