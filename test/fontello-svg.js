var test = require('tape');
var fontelloSvg = require('../');

test('SVG URL', function(t) {
  t.plan(3);
  var prefix = 'https://raw.github.com/fontello/';
  var svgs = [
    ['search', 'modernpics', prefix + 'modernpics.font/master/src/svg/search.svg'],
    ['spin1', 'fontelico', prefix + 'fontelico.font/master/src/svg/spin1.svg'],
    ['direction', 'fontawesome', prefix + 'awesome-uni.font/master/src/svg/direction.svg']
  ];
  svgs.forEach(function(svg) {
    t.equal(fontelloSvg.svgUrl(svg[0], svg[1]), svg[2]);
  });
});

test('Glyph CSS declarations', function(t) {
  t.plan(1);
  var glyph = fontelloSvg.createGlyph('search', 'modernpics', 'search', {
    red: 'rgb(255,0,0)',
    black: 'rgb(0,0,0)'
  });
  t.equal(glyph.cssDeclarations('svg/'),
          '.icon-search-red { background-image: ' +
          'url(svg/modernpics-search-red.svg) }\n' +
          '.icon-search-black { background-image: ' +
          'url(svg/modernpics-search-black.svg) }\n');
});

test('Glyph filenames', function(t) {
  t.plan(2);
  var glyph = fontelloSvg.createGlyph('search', 'modernpics');
  t.deepEqual(glyph.filenames(), ['modernpics-search-black.svg']);
  t.equal(glyph.filename('black'), 'modernpics-search-black.svg');
});

test('Glyph creator', function(t) {
  t.plan(3);
  var createGlyph = fontelloSvg.glyphCreator();
  var glyph1 = createGlyph('search', 'modernpics');
  var glyph2 = createGlyph('search', 'modernpics');
  t.equal(glyph1.id, 'search');
  t.equal(glyph2.id, 'search-2');
  var createGlyph2 = fontelloSvg.glyphCreator();
  var glyph3 = createGlyph2('search', 'modernpics');
  t.equal(glyph3.id, 'search');
});

test('Glyph CSS name', function(t) {
  t.plan(3);
  var createGlyph = fontelloSvg.glyphCreator();
  var glyph1 = createGlyph('search', 'modernpics');
  var glyph2 = createGlyph('search', 'modernpics');
  t.equal(glyph1.cssName('black'), '.icon-search-black');
  t.equal(glyph2.cssName('black'), '.icon-search-2-black');
  t.equal(glyph1.cssName('non-existing-color'), '.icon-search-black');
});

test('Valid Glyphs to download', function(t) {

  if (process.env.CI) return t.end();

  t.plan(2);

  var fs = require('fs');
  var os = require('os');
  var mkdirp = require('mkdirp');
  var rimraf = require('rimraf');

  var svgDir = os.tmpdir() + 'fontello-svg';
  var colors = {
    red: 'rgb(255,0,0)',
    black: 'rgb(0,0,0)'
  };

  // Recreates the temp directory
  rimraf.sync(svgDir);
  mkdirp.sync(svgDir);

  var createGlyph = fontelloSvg.glyphCreator();
  var glyphs = [
    createGlyph('search', 'modernpics', colors),
    createGlyph('search', 'modernpics', colors)
  ];

  // Creates fake SVG files
  glyphs.forEach(function(glyph) {
    glyph.filenames().forEach(function(filename) {
      fs.openSync(svgDir + '/' + filename, 'w');
    });
  });

  // Removes a single SVG
  fs.unlinkSync(svgDir + '/modernpics-search-2-black.svg');

  fontelloSvg.missingGlyphs(glyphs, svgDir, function(missingGlyphs) {
    t.equal(missingGlyphs.length, 1);
    t.equal(missingGlyphs[0].id, 'search-2');
  });
});

// test('Glyphs to download', function(t) {
//   t.plan();
//   // name, collection, path
//   var glyph = fontelloSvg.createGlyph();
//   fontelloSvg.glyphCssDeclarations(glyph);
//   svgs.forEach(function(svg) {
//     t.equal(fontelloSvg.svgUrl(svg[0], svg[1]), svg[2]);
//   });
// });
