/*
 * daemonic-inheritance-test.js: Tests for configuration inheritance of forever.startDaemon()
 *
 * (C) 2010 Charlie Robbins & the Contributors
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    vows = require('vows'),
    forever = require('../../lib/forever'),
    runCmd = require('../helpers').runCmd;

//
// ### function fileExists (file)
// #### @file {string} the file to check
// fs.exists and fs.existsSync are deprecated so we use this function to check if a log file exists
// see https://nodejs.org/api/fs.html#fs_fs_existssync_path
//
function fileExists(file){
  try {
    return fs.statSync(file).isFile();
  } catch(error){
    return false;
  }
}

vows.describe('forever/core/logs').addBatch({
  "When using forever" : {
    "the logrotation options" : {
      topic: function () {
        runCmd('start', [
          './test/fixtures/log-on-interval.json'
        ]);
        setTimeout(function (that) {
          forever.list(false, that.callback);
        }, 2000, this);
      },
      "should rotate the logs": function (err, procs) {
        assert.isTrue(fileExists(path.dirname(procs[0].logFile)+"/log-on-interval1.log.gz"));
      }
    }
  }
}).addBatch({
  "When the tests are over" : {
    "stop all forever processes and clean logs" : {
      topic: function () {
        var that = this;
        forever.stopAll().on('stopAll', function(procs){
            forever.cleanLogsSync();
            that.callback(null, procs);
        });
      },
      "should stop the correct number of procs, clean log files as well as rotated log files": function (err, procs) {
        assert.isTrue(!fileExists(path.dirname(procs[0].logFile)+"/log-on-interval.log"));
        assert.isTrue(!fileExists(path.dirname(procs[0].logFile)+"/log-on-interval1.log.gz"));
      }
    }
  }
}).export(module);
