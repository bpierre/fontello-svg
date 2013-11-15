var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var stream = require('stream');
var _ = require('underscore');
var request = require('request');
var mkdirp = require('mkdirp');
var nodupes = require('nodupes');
var async = require('async');

// Fontello URL special cases
var COLLECTION_FILTERS = [
  [/^fontawesome$/, 'awesome-uni.font'],
  [/^entypo$/, 'entypo'],
  [/^websymbols$/, 'websymbols-uni.font'],
  [/.*/, function(collection) { return collection + '.font' }]
];

// Returns the URL of a Fontello SVG
function svgUrl(name, collection) {
  for (var i = 0, result; i < COLLECTION_FILTERS.length; i++) {
    if (COLLECTION_FILTERS[i][0].test(collection)) {
      result = COLLECTION_FILTERS[i][1];
      collection = _.isFunction(result)? result(collection) : result;
      break;
    }
  }
  name = name.replace(/\-[1-9][0-9]*$/, '');
  return 'https://raw.github.com/fontello/' + collection +
         '/master/src/svg/' + name + '.svg';
}

// The Glyph object
var Glyph = {
  filename: function(color) {
    color = this.validColor(color);
    return this.collection + '-' + this.id + '-' + color + '.svg';
  },
  filenames: function() {
    return Object.keys(this.colors).map(function(color) {
      return this.filename(color);
    }.bind(this));
  },
  cssName: function(color, prefix) {
    if (prefix === undefined) prefix = 'icon-';
    color = this.validColor(color);
    return '.' + prefix + this.id + '-' + color;
  },
  // Returns CSS declaration(s) corresponding to the glyphs colors
  cssDeclarations: function(urlPath) {
    var declarations = '';
    if (!urlPath) urlPath = '';
    for (var color in this.colors) {
      declarations += this.cssName(color) + ' { background-image: url(' +
                      urlPath + this.filename(color) + ') }\n';
    }
    return declarations;
  },
  validColor: function(color) {
    return this.colors[color] ? color : Object.keys(this.colors)[0];
  }
};

// Creates and returns a Glyph instance
function createGlyph(name, collection, id, colors) {
  var glyph = Object.create(Glyph);
  if (!colors) colors = { 'black': 'rgb(0,0,0)' };
  if (!id) id = name;
  glyph.id = id;
  glyph.name = name;
  glyph.collection = collection;
  glyph.url = svgUrl(glyph.name, glyph.collection);
  glyph.colors = colors;
  glyph.exists = null;
  return glyph;
}

// Returns a function to create glyphs and incrementing their IDs as needed.
function glyphCreator() {
  var unique = nodupes();
  return function(name, collection, colors) {
    return createGlyph(name, collection, unique(name), colors);
  };
}

// Converts a raw glyph (right from the Fontello JSON) to a Glyph instance.
function rawGlyphToGlyph(rawGlyph, id, colors) {
  return createGlyph(rawGlyph.css, rawGlyph.src, id, colors);
}

// Creates and returns all Glyphs from a rawGlyphs list
function allGlyphs(rawGlyphs, colors) {
  var unique = nodupes();
  return rawGlyphs.map(function(rawGlyph) {
    var name = rawGlyph.css;
    var collection = rawGlyph.src;
    return createGlyph(name, collection, unique(name), colors);
  });
}

// Filters all glyphs to returns only the ones missing on the FS
function missingGlyphs(glyphs, svgDir, cb) {
  async.reject(glyphs, function(glyph, cb) {
    var filenames = glyph.filenames().map(function(filename) {
      return svgDir + '/' + filename;
    });
    async.every(filenames, fs.exists, cb);
  }, cb);
}

function svgTransformStream(fillColor) {
  var data='', tstream = new stream.Transform();
  tstream._transform = function(chunk, encoding, done) {
    data += chunk.toString();
    done();
  };
  tstream._flush = function(done) {
    if (fillColor) {
      data = data.replace(/<path/g, '<path fill="' + fillColor + '"');
    }
    this.push(data);
    done();
  };
  return tstream;
}

function downloadSvgs(glyphs, svgDir) {
  var downloader = Object.create(EventEmitter.prototype);
  EventEmitter.call(downloader);
  glyphs.forEach(function(glyph) {
    var url = svgUrl(glyph.name, glyph.collection);
    var svgFetcher = request(url);
    _.each(glyph.colors, function(fillColor, colorName) {
      var transform = svgTransformStream(fillColor);
      var fileWrite = fs.createWriteStream(svgDir + '/' + glyph.filename(colorName));
      fileWrite.on('end', function(fileWrite) {
        downloader.emit('svg-write');
      });
      svgFetcher.on('error', function() {
        downloader.emit('fetch-error', svgFetcher, fileWrite);
      });
      svgFetcher.pipe(transform).pipe(fileWrite);
    });
  });
  return downloader;
}

function writeCss(glyphs, cssPath, cb) {
  var fileWriter = fs.createWriteStream(cssPath);
  glyphs.forEach(function(glyph) {
    fileWriter.write(glyph.cssDeclarations());
  });
  fileWriter.end();
  cb();
}

exports.svgUrl = svgUrl;
exports.createGlyph = createGlyph;
exports.glyphCreator = glyphCreator;
exports.allGlyphs = allGlyphs;
exports.missingGlyphs = missingGlyphs;
exports.downloadSvgs = downloadSvgs;
exports.writeCss = writeCss;
