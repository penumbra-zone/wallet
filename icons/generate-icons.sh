#!/bin/bash

if ! [ -x "$(command -v cairosvg)" ]; then
	echo 'Error: cairosvg is not installed.' >&2
	echo 'Please install cairosvg using pip install cairosvg' >&2
	exit 1
fi

curl https://raw.githubusercontent.com/penumbra-zone/penumbra/main/docs/images/penumbra-dark.svg --output penumbra-logo.svg
SVG_FILE="penumbra-logo.svg"

# remove comments to make black
sed 's/<!--//g' $SVG_FILE >temp.svg
sed -i 's/-->//g' temp.svg

# Generate icons with black background using cairosvg
cairosvg temp.svg -o icon16.png -W 16 -H 16 --output-width 16
cairosvg temp.svg -o icon48.png -W 48 -H 48 --output-width 48
cairosvg temp.svg -o icon128.png -W 128 -H 128 --output-width 128

# Remove the temporary SVG file
rm temp.svg
