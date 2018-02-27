import React, { Component } from 'react';


export default class Check extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        lock: "",
        participant: "",
      },
      errors: {
        lock: "",
        participant: "",
      },
      success: false,
      error: false,
      procssing: false,
      data: {
        expiration: null,
        initiator: null,
        participant: null,
        token: null,
        isToken: null,
        value: null,
        exists: null
      }
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
  
    return {valid, messages};
  }

  handleSubmit = async () => {
    const {valid, messages} = await this.validate(this.state.values);

    if (!valid) {
      return this.setState({errors: messages});
    }
    const values = this.state.values;
    this.setState({processing: true});
    try {
      console.log(
        values.lock,
        values.participant,
        {
          from: this.props.account,
        },
      );
      const data = await this.props.instance.swaps(
        values.participant,
        values.lock,
        {
          from: this.props.account,
        },
      );
      
      this.setState({
        success: true,
        data: {
          expiration: data[0].toNumber(),
          initiator: data[1],
          participant: data[2],
          value: data[4] ? data[3].toNumber() : this.props.web3.utils.fromWei(data[3].toString(), 'ether'),
          isToken: data[4],
          token: data[5],
          exists: data[6]
        },
        processing: false
      });
    } catch (error) {
      console.log(error);
      this.setState({error: true, processing: false});
    }
  }

  render() {
    // console.log(this.state);
    return (
      <div className="action-container pure-u-1-10 offset-1-8">
        <h2>Check Atomic Swap</h2>
        {this.state.success && <h4 style={{color: '#00ff00'}}>Found swap.</h4>}
        {this.state.error && <h4 style={{color: '#ff0000'}}>Something wrong happened.</h4>}
        {this.state.procssing && <h4>Please be patient, we are processing your transaction.</h4>}
        <form className="pure-form pure-form-aligned">
          <fieldset>
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
              <button type="button" onClick={this.handleSubmit} className="pure-button pure-button-primary pure-u-1-2 aligned-offset">Check</button>
          </fieldset>
        </form>

        {this.state.success && 
        <div>
          <p><strong>Exipres at:</strong>{this.state.data.expiration}</p>
          <p><strong>Initiated by:</strong>{this.state.data.initiator}</p>
          <p><strong>Participant:</strong>{this.state.data.participant}</p>
          <p><strong>Value:</strong>{this.state.data.value}</p>
          <p><strong>Is Token:</strong>{this.state.data.isToken ? 'Yes' : 'No'}</p>
          <p><strong>Token:</strong>{this.state.data.token}</p>
          <p><strong>Active:</strong>{this.state.data.exists ? 'Yes' : 'No'}</p>
        </div>}
      </div>
    );
  }
};