#!/bin/bash

if ! [ -x "$(command -v cairosvg)" ]; then
	echo 'Error: cairosvg is not installed.' >&2
	echo 'Please install cairosvg using pip install cairosvg' >&2
	exit 1
fi

curl https://raw.githubusercontent.com/penumbra-zone/penumbra/main/docs/images/penumbra-dark.svg --output penumbra-logo.svg
SVG_FILE="penumbra-logo.svg"

# Add black background to the SVG using sed
sed -e '1s/<?xml version="1.0" encoding="UTF-8" standalone="no"?>/&\n<svg xmlns="http:\/\/www.w3.org\/2000\/svg" xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink">/' -e '/<\/svg>/s/$/\n<rect x="0" y="0" width="100%" height="100%" fill="black" \/>\n<\/svg>/' $SVG_FILE >temp.svg

# Generate icons with black background using cairosvg
cairosvg temp.svg -o icon16.png -W 16 -H 16
cairosvg temp.svg -o icon48.png -W 48 -H 48
cairosvg temp.svg -o icon128.png -W 128 -H 128

# Remove the temporary SVG file
rm temp.svg
