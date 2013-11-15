var test = require('tape');
var fontelloSvg = require('../');

test('SVG URL', function(t) {
  function githubUrl(collection, name) {
    return 'https://raw.github.com/fontello/' + collection +
           '/master/src/svg/' + name + '.svg';
  }
  var svgs = [
    ['emo-happy', 'fontelico', githubUrl('fontelico.font', 'emo-happy')],
    ['glass', 'fontawesome', githubUrl('awesome-uni.font','glass')],
    ['note', 'entypo', githubUrl('entypo', 'note')],
    ['music-outline', 'typicons', githubUrl('typicons.font', 'music-outline')],
    ['search', 'iconic', githubUrl('iconic-uni.font', 'search')],
    ['search', 'modernpics', githubUrl('modernpics.font', 'search')],
    ['windy-rain-inv', 'meteocons', githubUrl('meteocons.font', 'windy-rain-inv')],
    ['search', 'mfglabs', githubUrl('mfglabs.font', 'search')],
    ['aboveground-rail', 'maki', githubUrl('maki.font', 'aboveground-rail')],
    ['duckduckgo', 'zocial', githubUrl('zocial.font', 'duckduckgo')],
    ['facebook', 'brandico', githubUrl('brandico.font', 'facebook')],
    ['glass', 'elusive', githubUrl('elusive.font', 'glass')],
    ['music', 'linecons', githubUrl('linecons.font', 'music')],
    ['search', 'websymbols', githubUrl('websymbols-uni.font', 'search')],
    ['search', 'websymbols', githubUrl('websymbols-uni.font', 'search')],
    ['progress-7', 'websymbols', githubUrl('websymbols-uni.font', 'progress-7')]
  ];
  t.plan(svgs.length);
  svgs.forEach(function(svg) {
    t.equal(fontelloSvg.svgUrl(svg[0], svg[1]), svg[2]);
  });
});

test('Names fixer', function(t) {
  var config = require('./fontello-config.json');
  var rawGlyphs = config.glyphs;
  var fixedRawGlyphs = fontelloSvg.fixNames(rawGlyphs);

  t.plan(5);
  t.equal(rawGlyphs[5].css, 'search');
  t.equal(rawGlyphs[7].css, 'search');
  t.equal(rawGlyphs[11].css, 'glass');
  t.equal(rawGlyphs[13].css, 'search');
  t.equal(rawGlyphs[14].css, 'progress-4');
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
  var glyph2 = createGlyph('search', 'iconic');
  t.equal(glyph1.id, 'search');
  t.equal(glyph2.id, 'search-2');
  var createGlyph2 = fontelloSvg.glyphCreator();
  var glyph3 = createGlyph2('search', 'mfglabs');
  t.equal(glyph3.id, 'search');
});

test('Glyph CSS name', function(t) {
  t.plan(3);
  var createGlyph = fontelloSvg.glyphCreator();
  var glyph1 = createGlyph('search', 'modernpics');
  var glyph2 = createGlyph('search', 'iconic');
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
    createGlyph('search', 'iconic', colors)
  ];

  // Creates fake SVG files
  glyphs.forEach(function(glyph) {
    glyph.filenames().forEach(function(filename) {
      fs.openSync(svgDir + '/' + filename, 'w');
    });
  });

  // Removes a single SVG
  fs.unlinkSync(svgDir + '/iconic-search-black.svg');

  fontelloSvg.missingGlyphs(glyphs, svgDir, function(missingGlyphs) {
    t.equal(missingGlyphs.length, 1);
    t.equal(missingGlyphs[0].id, 'search-2');
  });
});
