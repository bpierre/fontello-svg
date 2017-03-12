#!/usr/bin/env node

var fontelloSvg = require('../');
var _ = require('underscore');
var app = require('commander');
var colors = require('colors');
var fs = require('fs');

function l(msg, indent, nlBefore, nlAfter) {
  if (!indent) indent = 0;
  if (Array.isArray(msg)) msg = msg.join('\n');
  while (indent--) msg = ' ' + msg;
  if (nlBefore) msg = '\n' + msg;
  if (nlAfter) msg = msg + '\n';
  process.stdout.write(msg + '\n');
}

// Get an object from a string like this: "key : value | key: value"
function argsObject(val) {
  return _.object(val.split('|').map(function(pair) {
    return pair.split(':').map(function(v) {
      return v.trim();
    });
  }));
}

colors.setTheme({
  info: 'green',
  data: 'grey',
  error: 'red'
});

app.version('0.0.1');
app.usage('--config <config file> --out <dir> [options]');
app.option('-c, --config <config file>', 'Set the Fontello configuration file (required)');
app.option('-o, --out <dir>', 'Set the export directory (required)');
app.option('-f, --fill-colors <colors>', 'Transform the SVG paths to the specified colors. Syntax: --fill-colors "black:rgb(0,0,0) | red:rgb(255,0,0)"', argsObject);
app.option('-p, --css-path <path>', 'Set a CSS path for SVG backgrounds');
app.option('--file-format <format>', 'Override the default filename. Values: {0} - collection, {1} - name, {2} - color. Syntax: "{0}-{1}-{2}.svg" | "{0}-Custom-{1}.svg" "');
app.option('--no-css', 'Do not create the CSS file');
app.option('--no-skip', 'Do not skip existing files');
app.option('--verbose', 'Verbose output');
app.parse(process.argv);

// Required parameters
if (!app.config || !app.out) {
  l([
    '',
    '  Error: missing required parameters (--config, --out)'.error,
    ''
  ]);
  app.help();
}

var emitter = fontelloSvg.fontelloSvg(app.config, app.out, app);

emitter.on('svg-write', function(msg, indent, nlBefore, nlAfter) {
  l(msg, indent, nlBefore, nlAfter);
});

