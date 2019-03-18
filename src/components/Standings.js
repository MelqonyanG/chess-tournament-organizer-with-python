import React from "react";

class Standings extends React.Component {
    render() {
        return (
          <div className="container">
          <div>
              <table className="table">
                <tbody>
                  <tr>
                    <td><h1>Standings</h1></td>
                  </tr>
                  <tr>
                    <td>Score</td>
                    <td>Name</td>
                  </tr>
                </tbody>
              </table>
          </div>
          <div className="scrollmenu" style={{height: '300px'}}>
              <table className="table">
              <tbody>
                {this.props.standing}
              </tbody>
              </table>
          </div>
          </div>
      )
    }
}

export default Standings;
