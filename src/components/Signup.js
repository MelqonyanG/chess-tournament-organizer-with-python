import React from "react";
import {socket} from "../index";

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.register = this.register.bind(this);
  }
    render() {
        return (
          <div className="container">
            <div>
              <h1>Sign Up</h1>
              <p>Please fill in this form to create an account.</p>
              <hr/>
              <label htmlFor="name"><b>Name</b></label>
              <input type="text" id="name" placeholder="Enter Name" name="name" required />
              <label htmlFor="surname"><b>Surname</b></label>
              <input type="text" id="surname" placeholder="Enter Surname" name="surname" required />
              <label htmlFor="email"><b>Email</b></label>
              <input type="text" id="email" placeholder="Enter Email" name="email" required />
              <label htmlFor="psw"><b>Password</b></label>
              <input type="password" id="pass" placeholder="Enter Password" name="psw" required />
              <label htmlFor="psw-repeat"><b>Repeat Password</b></label>
              <input type="password" id = "passAgain" placeholder="Repeat Password" name="psw-repeat" required />
              <hr/>
              <div id="response"></div>
            <button type="button" className="registerbtn" onClick={this.register}>Sign Up</button>
            </div>
        </div>
      )
    }

    register(){
      document.getElementById("pass").style.backgroundColor = "#FFFFFF";
      document.getElementById("passAgain").style.backgroundColor = "#FFFFFF";
      document.getElementById("email").style.backgroundColor = "#FFFFFF";
      document.getElementById("surname").style.backgroundColor = "#FFFFFF";
      document.getElementById("name").style.backgroundColor = "#FFFFFF";
      var name = document.getElementById("name").value;
      var surname = document.getElementById("surname").value;
      var email = document.getElementById("email").value;
      var password = document.getElementById("pass").value;
      var passwordAgain = document.getElementById("passAgain").value;
      var reg = true;
      if(name.length === 0){
        reg = false;
        document.getElementById("name").value = "";
        document.getElementById("name").style.backgroundColor = "#DAF7A6";
        document.getElementById("name").placeholder = "Please fill out this field";
      }

      if(surname.length === 0){
        reg = false;
        document.getElementById("surname").value = "";
        document.getElementById("surname").style.backgroundColor = "#DAF7A6";
        document.getElementById("surname").placeholder = "Please fill out this field";
      }

      if(password.length === 0){
        reg = false;
        document.getElementById("pass").value = "";
        document.getElementById("pass").style.backgroundColor = "#DAF7A6";
        document.getElementById("pass").placeholder = "Please fill out this field";
      }

      if(passwordAgain.length === 0){
        reg = false;
        document.getElementById("passAgain").value = "";
        document.getElementById("passAgain").style.backgroundColor = "#DAF7A6";
        document.getElementById("passAgain").placeholder = "Please fill out this field";
      }
      if(password !== passwordAgain){
        reg = false;
        document.getElementById("pass").value = "";
        document.getElementById("pass").style.backgroundColor = "#DAF7A6";
        document.getElementById("pass").placeholder = "Please check your password";
        document.getElementById("passAgain").value = "";
        document.getElementById("passAgain").style.backgroundColor = "#DAF7A6";
        document.getElementById("passAgain").placeholder = "Please check your password";
      }

      if(!this.validateEmail(email)){
        reg = false;
        document.getElementById("email").value = "";
        document.getElementById("email").style.backgroundColor = "#DAF7A6";
        document.getElementById("email").placeholder = "Please enter valid email";
      }

      if(!this.validateName(name)){
        reg = false;
        document.getElementById("name").value = "";
        document.getElementById("name").style.backgroundColor = "#DAF7A6";
        document.getElementById("name").placeholder = "Please enter valid name (name must contain only letters)";
      }

      if(!this.validateName(surname)){
        reg = false;
        document.getElementById("surname").value = "";
        document.getElementById("surname").style.backgroundColor = "#DAF7A6";
        document.getElementById("surname").placeholder = "Please enter valid surname (surname must contain only letters)";
      }

      if(reg){
        var data = {
          "name": name,
          "surname": surname,
          'email': email,
          "pass": password,
          "sid" : socket.id
        }
        socket.emit('registerUser', data);
      }else{
        console.log("incorrect form");
      }
    }

    validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    validateName(name) {
    var re = /^[A-Za-z\s]+$/;
    return re.test(String(name).toLowerCase());
    }
}

export default Signup;
