import React from "react";
import {socket} from "../index";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }
    render() {
        return (
          <div className="container">
            <div>
              <h1>Login</h1>
              <p>Please Enter Your Email and Password</p>
              <hr/>
              <label htmlFor="email"><b>Email</b></label>
              <input type="text" id="email" placeholder="Enter Email" name="email" required />
              <label htmlFor="psw"><b>Password</b></label>
              <input type="password" id="pass" placeholder="Enter Password" name="psw" required />
              <hr/>
              <div id="response"></div>
            <button type="submit" className="registerbtn" onClick={this.login}>Login</button>
            </div>
        </div>
      )
    }

    login(){
      document.getElementById("pass").style.backgroundColor = "#FFFFFF";
      var email = document.getElementById("email").value;
      var password = document.getElementById("pass").value;
      var log = true;

      if(password.length === 0){
        log = false;
        document.getElementById("pass").value = "";
        document.getElementById("pass").style.backgroundColor = "#DAF7A6";
        document.getElementById("pass").placeholder = "Please fill out this field";
      }

      if(!this.validateEmail(email)){
        log = false;
        document.getElementById("email").value = "";
        document.getElementById("email").style.backgroundColor = "#DAF7A6";
        document.getElementById("email").placeholder = "Please enter valid email";
      }

      if(log){
        var data = {
          "email": email,
          "password": password,
          "sid": socket.id
        }
        console.log(data);
        socket.emit('loginUser', data);
      }
    }

    validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

}

export default Login;
