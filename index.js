#!/usr/bin/env node
"use strict";

var fs = require("fs");
var _ = require("lodash");
var cli = require("commander");
var originalPackage = require(process.cwd() + "/package.json");
var tempPackage = _.clone(originalPackage);
var exec = require("child_process").exec;

var run = function(cmd, cb) {
  var child = exec(cmd, function(error, stdout, stderr) {
    if (stderr !== null) {
      console.log("" + stderr);
    }
    if (stdout !== null) {
      console.log("" + stdout);
    }
    if (error !== null) {
      console.log("" + error);
    }
    if (cb) {
      cb();
    }
  });
};

// only works for dev dependencies
cli
  .command("install [input_string]")
  .description("Check for word or phrase in translation memory")
  .action(function(input_string) {
    if (input_string) {
      if (tempPackage.installSubsets) {
        if (tempPackage.installSubsets[input_string]) {
          const subset = tempPackage.installSubsets[input_string];
          let devDependencies;

          if (subset.whitelist) {
            devDependencies = _.pick(tempPackage.devDependencies, subset.whitelist);
          } else if (subset.blacklist) {
            devDependencies = _.omit(tempPackage.devDependencies, subset.blacklist);
          } else {
            throw "No valid subset actions found";
          }

          tempPackage.devDependencies = devDependencies;

          fs.writeFile(process.cwd() + "/package.json", JSON.stringify(tempPackage, null, "  "), function(err) {
            if (err) throw err;
            run("type yarn 2>/dev/null && yarn || npm set depth=0; npm install --silent", function() {
              fs.writeFile(process.cwd() + "/package.json", JSON.stringify(originalPackage, null, "  "), function(err) {
                if (err) throw err;
              });
            });
          });
        } else {
          throw "No install subset with that name";
        }
      } else {
        throw "No install subsets in package.json";
      }
    } else {
      throw "Please provide an install subset name";
    }
  });

cli.command("*").action(() => cli.help());

cli.parse(process.argv);

if (cli.args.length === 0) cli.help();

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", err => {
  console.log("ERROR: " + err);
  process.exit();
});
