#!/usr/bin/env node
"use strict";

var fs = require("fs");
var _ = require("lodash");
var shelljs = require("shelljs");
var cli = require("commander");
var cwd = process.cwd();
var packageJson = require(cwd + "/package.json");
var tempPackage = _.clone(packageJson);
var spawn = require("child_process").spawn;

cli
  .command("install [input_string]")
  .alias("i")
  .option("-c, --clean", "remove node_modules first")
  .option("--npm", "use npm to install")
  .description("install a given subset defined in package.json")
  .action(function(input_string, options) {
    if (input_string) {
      if (packageJson.subsets) {
        if (packageJson.subsets[input_string]) {
          const subset = packageJson.subsets[input_string];
          let devDependencies;

          if (subset.whitelist) {
            devDependencies = _.pick(packageJson.devDependencies, subset.whitelist);
          } else if (subset.blacklist) {
            devDependencies = _.omit(packageJson.devDependencies, subset.blacklist);
          } else {
            throw "No valid subset actions found";
          }

          tempPackage.devDependencies = devDependencies;

          if (options.clean) {
            shelljs.rm("-rf", cwd + "/yarn.lock");
            shelljs.rm("-rf", cwd + "/package-lock.json ");
            shelljs.rm("-rf", cwd + "/node_modules");
          }

          fs.writeFile(cwd + "/package.json", JSON.stringify(tempPackage, null, "  "), function(err) {
            if (err) throw err;

            if (!options.npm && shelljs.which('yarn')){
              var installer = spawn("yarn", [], { stdio: "inherit" });
            } else {
              var installer = spawn("npm", ['install'], { stdio: "inherit" });
            }

            installer.on("close", function(code) {
              if (code !== 0) {
                throw "Error code " + code;
              } else {
                installer.unref();
                console.log("Installation of subset " + input_string + " successful");
              }
              fs.writeFile(cwd + "/package.json", JSON.stringify(packageJson, null, "  "), function(err) {
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

process.on("uncaughtException", err => {
  console.log("ERROR: " + err);
  fs.writeFile(cwd + "/package.json", JSON.stringify(packageJson, null, "  "), function(err) {
    if (err) throw err;
  });
  process.exit();
});
