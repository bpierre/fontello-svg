# fontello-svg

fontello-svg is a command-line tool to generate the SVG versions of a [Fontello](http://fontello.com/) icon set, with a corresponding CSS file.

[![Build Status](https://travis-ci.org/bpierre/fontello-svg.png?branch=master)](https://travis-ci.org/bpierre/fontello-svg)

## Installation

```shell
$ npm install fontello-svg -g
```

## Example

You need to select and download an icon set from the Fontello website, then indicate the path of the `config.json` file with the `--config` parameter.

```shell
$ fontello-svg --config fontello-config-file.json \
                  --out ./iconset-directory \
                  --fill-colors "grey:rgb(77,78,83)|blue:rgb(0,149,221)"
```

## Usage

```shell
  Usage: fontello-svg --config <config file> --out <dir> [options]

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -c, --config <config file>  Set the Fontello configuration file (required)
    -o, --out <dir>             Set the export directory (required)
    -f, --fill-colors <colors>  Transform the SVG paths to the specified colors. Syntax: --fill-colors "black:rgb(0,0,0) | red:rgb(255,0,0)"
    -p, --css-path <path>       Set a CSS path for SVG backgrounds
    --file-format <format>      Override the default filename. Values: {0} - collection, {1} - name, {2} - color. Syntax: --file-format "{0}-{1}-{2}.svg" | --file-format "{0}-Custom-{1}.svg"
    --no-css                    Do not create the CSS file
    --no-skip                   Do not skip existing files
    --verbose                   Verbose output
```

## Tutorial

[Sara Soueidan](https://sarasoueidan.com/) wrote a blog post explaining how to use fontello-svg and other tools to convert an icons-as-font configuration into SVG files. Read it here: <https://sarasoueidan.com/blog/icon-fonts-to-svg/>

## License

[MIT](http://pierre.mit-license.org/)
