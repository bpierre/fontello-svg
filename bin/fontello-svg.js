#!/usr/bin/env node

var fontelloSvg = require('../');
var _ = require('underscore');
var path = require('path');
var app = require('commander');
var colors = require('colors');

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
app.option('-p, --css-path <path>', 'Set a CSS path for SVG backgrounds.');
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

// Start
var config = require(path.resolve(app.config));
start(config.glyphs);

function start(rawGlyphs) {
  var out = path.resolve(app.out);
  var colors = app.fillColors || {'black': '#000000'};
  var glyphs = fontelloSvg.allGlyphs(rawGlyphs, colors);
  var glyphsToDl = app.skip? glyphs : fontello.missingGlyphs(glyphs);

  var downloader = fontelloSvg.downloadSvgs(glyphsToDl, out);

  downloader.on('fetch-error', function(httpStream, writeStream) {
    l('[error]'.error + ' Download failed: ' + httpStream.href, 2);
  });
  downloader.on('svg-write', function(writeStream) {
    l('[saved]'.info + ' SVG file written: ' + writeStream.path, 2);
  });

  fontelloSvg.writeCss(glyphs, out + '/index.css', function() {
    l('[saved]'.info + (' ' + out + '/index.css').data, 2);
  });
}
