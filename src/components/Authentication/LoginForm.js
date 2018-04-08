import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';

class LoginForm extends Component {
  constructor(props) {
      super(props);
      this.state = {
          username: null,
          password: null
      };
      this.onChange = this.onChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSubmit(event){
    event.preventDefault();
    this.props.onSubmit(this.state.username,this.state.password);
    this.setState({username: null, password:null});
    document.getElementsByName('username')[0].focus();
  }

  render(){
    const { username, password} = this.state;
    const {error}=this.props;
    return(
      <div>
          <a className="hiddenanchor" id="signup"></a>
          <a className="hiddenanchor" id="signin"></a>

          <div className="login_wrapper">
              <div className="animate form login_form">
                  <section className="login_content">

                      <form>
                          <h1>RegOpz Login</h1>
                          <div className="form-group has-feedback">
                              <input type="text"
                              className="x_title form-control"
                              readOnly={true}
                              disabled={true}
                              name="tenantname"
                              value={ this.props.tenant }
                              required="required"/>
                              <span className="fa fa-bank form-control-feedback right"></span>
                          </div>
                          <div className="form-group has-feedback">
                              <input type="text"
                              className="form-control"
                              placeholder="Username"
                              name="username"
                              value={ this.state.username }
                              onChange={ this.onChange }
                              title={this.state.username ? "" : "Please enter username"}
                              required="required"/>
                              <span className="fa fa-user form-control-feedback right"></span>
                          </div>
                          <div className="form-group has-feedback">
                              <input type="password"
                              className="form-control"
                              placeholder="Password"
                              name="password"
                              value={ this.state.password }
                              onChange={ this.onChange }
                              title={this.state.password ? "" : "Please enter password"}
                              required="required"/>
                              <span className="fa fa-eye-slash form-control-feedback right"></span>
                              { error ? <div className="red">Couldn't match your account details, please check!</div> : '' }
                          </div>
                          <div>

                              <button className="btn btn-primary btn-sm submit" onClick={ this.onSubmit } disabled={!(username && password) || this.props.isLoading}>Log in</button>
                              <button type="button" className="reset_pass btn btn-link btn-xs" onClick={ this.props.onResetPassword }>Lost your password?</button>
                          </div>

                          <div className="clearfix"></div>

                          <div className="separator">
                              <div className="clearfix"></div>
                              <p className="change_link">{"   New user?"}
                                <button className="btn btn-link btn-xs" onClick={ this.props.onSignup }>Sign up</button>
                              </p>
                              <div className="copyright">
                                  <h1><img src="../images/logo.png" className="img-circle "></img> RegOpz</h1>
                                  <p>©2017-18 All Rights Reserved. RegOpz Pvt. Ltd.</p>
                              </div>
                          </div>
                      </form>
                  </section>
              </div>
          </div>
      </div>
    );
  }
}

export default LoginForm;
