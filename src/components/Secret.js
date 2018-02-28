import React, { Component } from 'react';
import crypto from 'crypto-browserify';

export default class Secret extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        secret: "",
        lock: ""
      },
    }
  }

  handleSubmit = () => {
    const secretBytes = crypto.randomBytes(32);
    const secret = `0x${secretBytes.toString('hex')}`;
    const lock = `0x${crypto.createHash("ripemd160").update(secretBytes).digest("hex")}`;
    this.setState({
      values: {
        secret,
        lock
      }
    });
  }

  render() {
    return (
      <div className="action-container pure-u-1-10 offset-1-8">
        <h2>Generate secret and lock</h2>
        <form className="pure-form pure-form-aligned">
          <button type="button" onClick={this.handleSubmit} className="pure-button pure-button-primary pure-u-1-2 aligned-offset">Generate</button>
          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="secret">Secret:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="secret"
                id="secret"
                value={this.state.values.secret || ""}
              />
            </div>
            <div className="pure-control-group">
              <label htmlFor="lock">Lock:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="lock"
                id="lock"
                value={this.state.values.lock || ""}
              />
            </div>
          </fieldset>
        </form>
      </div>
    );
  }
};