import React, { Component } from 'react';


export default class Initiate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        expiration: 0,
        lock: "",
        participant: "",
        isToken: false,
        token: "",
        value: 0
      },
      errors: {
        expiration: "",
        lock: "",
        participant: "",
        token: "",
        value: ""
      },
      success: false,
      error: false,
    }
  }
  async getNow() {
    const number = await this.props.web3.eth.getBlockNumber();
    const block = await this.props.web3.eth.getBlock(number);
    console.log(`Blockchain time: ${block.timestamp}`);
    return block.timestamp;
  }
  async componentDidMount() {
    if (this.props.web3) {
      this.setState({values: {expiration: await this.getNow() + 86400}});
    }
  }

  handleChange = (path, value) => {
    console.log(path, value);
    this.setState({
      values: {
        ...this.state.values,
        [path]: value
      },
      success: false,
      error: false,
    });
  }

  async validate(data) {
    let valid = true;
    const messages = {};
    const now = await this.getNow();

    if(data.expiration < now) {
      messages.expiration = "Can't initiate a swap with an expiration date in the past.";
      valid = false;
    }

    if (!data.lock) {
      messages.lock = "Lock can't be empty.";
      valid = false;
    }

    if(!data.participant) {
      messages.participant = "Participant address can't be empty.";
      valid = false;
    } else if(! await this.props.web3.utils.isAddress(data.participant)) {
      messages.participant = "The adddress provided for participant is not a valid one.";
      valid = false;
    }

    if (data.isToken && !data.token) {
      messages.token = "Token address can't be empty.";
      valid = false;
    } else if(data.isToken && !await this.props.web3.utils.isAddress(data.token)) {
      messages.token = "The adddress provided for token is not a valid one.";
      valid = false;
    }

    if (!data.value || data.value < 0) {
      messages.value = "Value can't be empty or lower than 0";
      valid = false;
    }
  
    return {valid, messages};
  }

  handleSubmit = async () => {
    const {valid, messages} = await this.validate(this.state.values);

    if (!valid) {
      return this.setState({errors: messages});
    }
    const values = this.state.values;
    try {
      console.log(
        values.expiration,
        values.lock,
        values.participant,
        values.token || 0x0,
        values.isToken || false,
        values.isToken ? parseFloat(values.value) : 0,
        {
          from: this.props.account,
          value: parseInt(!values.isToken ? this.props.web3.utils.toWei(values.value, 'ether')  : 0, 10),
        },
      );
      const data = await this.props.instance.initiate(
        values.expiration,
        values.lock,
        values.participant,
        values.token || 0x0,
        values.isToken || false,
        values.isToken ? this.props.web3.utils.toBN(values.value) : 0,
        {
          from: this.props.account,
          value: parseInt(!values.isToken ? this.props.web3.utils.toWei(values.value, 'ether')  : 0, 10),
        },
      );
      console.log(data);
      this.setState({success: true});
    } catch (error) {
      console.log(error);
      this.setState({error: true});
    }
  }

  render() {
    return (
      <div className="action-container pure-u-1-10 offset-1-8">
        <h2>Initate Atomic Swap</h2>
        {this.state.success && <h4 style={{color: '#00ff00'}}>Swap succesfully initiated</h4>}
        {this.state.error && <h4 style={{color: '#ff0000'}}>Something wrong happened.</h4>}
        <form className="pure-form pure-form-aligned">
          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="expiration">Expires at:</label>
              <input
                type="number"
                className="pure-u-1-2"
                placeholder="Expires at"
                name="expiration"
                id="expiration"
                value={this.state.values.expiration || 0}
                onChange={(e) => this.handleChange('expiration', e.target.value)}
              />
              <span className="pure-form-message-inline">Defaults to a day from now.</span>
              {this.state.errors.expiration && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.expiration}</span>}
            </div>
            <div className="pure-control-group">
              <label htmlFor="lock">Hash lock:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="lock"
                id="lock"
                value={this.state.values.lock || ""}
                onChange={(e) => this.handleChange('lock', e.target.value)}
              />
              {this.state.errors.lock && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.lock}</span>}
            </div>
            <div className="pure-control-group">
              <label htmlFor="participant">Participant address:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="participant"
                id="participant"
                value={this.state.values.participant || ""}
                onChange={(e) => this.handleChange('participant', e.target.value)}
              />
              {this.state.errors.participant && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.participant}</span>}
            </div>
            <div className="pure-control-group">
              <label htmlFor="isToken">Is a token swap</label>
              <input
                  id="isToken"
                  type="checkbox"
                  checked={this.state.values.isToken || false}
                  onChange={(e) => this.handleChange('isToken', e.target.checked)}
                />
            </div>
            <div className="pure-control-group">
              <label htmlFor="token">Token address:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="token"
                id="token"
                value={this.state.values.token || ""}
                onChange={(e) => this.handleChange('token', e.target.value)}
              />
              {this.state.errors.token && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.token}</span>}
            </div>
            <div className="pure-control-group">
              <label htmlFor="value">Value:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0"
                name="value"
                value={this.state.values.value || 0}
                step="any"
                onChange={(e) => this.handleChange('value', e.target.value)}
              />
              <span className="pure-form-message-inline">{this.state.values.isToken ? 'Tokens' : 'Ether'}</span>
              {this.state.errors.value && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.value}</span>}
            </div>
              <button type="button" onClick={this.handleSubmit} className="pure-button pure-button-primary pure-u-1-2 aligned-offset">Swap</button>
          </fieldset>
        </form>
      </div>
    );
  }
};