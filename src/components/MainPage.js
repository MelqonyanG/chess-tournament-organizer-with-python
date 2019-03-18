import React from "react";
import Login from "./Login";
import Signup from "./Signup";

class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signup:false,
      login:true
    }
    this.signUp = this.signUp.bind(this);
    this.logIn = this.logIn.bind(this);
  }
    render() {
        return (
          <div className="container">
            <div>
              <div id="buttons">
                <button type="button" id="signupBTN" onClick={this.signUp}>Signup</button>
                <button type="button" id="loginBTN" onClick={this.logIn}>Login</button>
              </div>
              {this.state.signup?<Signup/> : null}
              {this.state.login?<Login/> : null}
            </div>
          </div>
      )
    }
    signUp(){
      this.setState({
        signup:true,
        login:false
      });
    }

    logIn(){
      this.setState({
        signup:false,
        login:true
      });
    }
}

export default MainPage;
