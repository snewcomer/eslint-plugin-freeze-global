/**
 * @fileoverview Object.freeze globals to prevent accidental mutation during the life of your program.
 * @author Scott Newcomer
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


module.exports = {
  rules: requireIndex(__dirname + "/rules"),
  config: requireIndex(__dirname + "/config"),
};



