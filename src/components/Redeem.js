import React, { Component } from 'react';


export default class Redeem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        secret: "",
      },
      errors: {
        secret: ""
      },
      success: false,
      error: false,
      transaction: null,
      processing: false,
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

    if (!data.secret) {
      messages.secret = "Secret can't be empty.";
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
        values.secret,
        {
          from: this.props.account,
        },
      );
      const data = await this.props.instance.redeem(
        values.secret,
        {
          from: this.props.account,
        },
      );

      this.setState({success: true, transaction: data, processing: false});
      console.log(data);
    } catch (error) {
      console.log(error);
      this.setState({error: true, processing: false});
    }
  }

  render() {
    return (
      <div className="action-container pure-u-1-10 offset-1-8">
        <h2>Redeem Atomic Swap</h2>
        {this.state.success && <h4 style={{color: '#00ff00'}}>Swap succesfully redeemed. <a href={`https://kovan.etherscan.io/tx/${this.state.transaction.tx}`}>{this.state.transaction.tx}</a></h4>}
        {this.state.error && <h4 style={{color: '#ff0000'}}>Something wrong happened.</h4>}
        {this.state.procssing && <h4>Please be patient, we are processing your transaction.</h4>}
        <form className="pure-form pure-form-aligned">
          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="secret">Secret lock:</label>
              <input
                type="text"
                className="pure-u-1-2"
                placeholder="0x"
                name="secret"
                id="secret"
                value={this.state.values.secret || ""}
                onChange={(e) => this.handleChange('secret', e.target.value)}
              />
              {this.state.errors.secret && <span className="pure-form-message error pure-u-1-2 aligned-offset">{this.state.errors.secret}</span>}
            </div>
              <button type="button" onClick={this.handleSubmit} className="pure-button pure-button-primary pure-u-1-2 aligned-offset">Redeem</button>
          </fieldset>
        </form>
      </div>
    );
  }
};