import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

//import pages
import Dashboard from "./dashboard";


class Pages extends Component {
  render() {
 
    return (
      <div
        className="app-main"
        style={{
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >


        <div className="contentWrapper">
          <Switch>
            <Route path="/" exact component={Dashboard} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default Pages;
