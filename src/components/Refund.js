import React, { Component } from 'react';


export default class Refund extends Component {
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
    try {
      console.log(
        values.lock,
        values.participant,
        {
          from: this.props.account,
        },
      );
      const data = await this.props.instance.redeem(
        values.lock,
        values.participant,
        {
          from: this.props.account,
        },
      );

      this.setState({success: true});
      console.log(data);
    } catch (error) {
      console.log(error);
      this.setState({error: true});
    }
  }

  render() {
    return (
      <div className="action-container pure-u-1-10 offset-1-8">
        <h2>Refund Atomic Swap</h2>
        {this.state.success && <h4 style={{color: '#00ff00'}}>Swap succesfully refunded.</h4>}
        {this.state.error && <h4 style={{color: '#ff0000'}}>Something wrong happened.</h4>}
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
              <button type="button" onClick={this.handleSubmit} className="pure-button pure-button-primary pure-u-1-2 aligned-offset">Refund</button>
          </fieldset>
        </form>
      </div>
    );
  }
};