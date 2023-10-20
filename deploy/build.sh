#!/bin/bash

# save the current and base directories
executeDir=$(dirname "$(readlink -f "$0")")
baseDir=$(pwd)


# define the function for the build and package steps
# checking if pkg is already installed
command -v pkg >/dev/null 2>&1 || { echo >&2 "PKG is required but it's not installed. Aborting."; exit 1; }

# Get back to the current folder if not already
cd "${baseDir}"

# Build the app
cd ..
yarn build

# Get back to the current folder
cd "${executeDir}"

# Copy the folder and the file
cp -r ../out ./public
cp ../db.json ./db.json

## Get the dependencies
yarn install
# Compile the exe for index.js with PKG
pkg index.js --targets "node16-${targetOS}-x64"

# pkg -t node16-win-x64,node16-linux-x64 index.js
pkg -t node16-win-x64,node16-linux-x64 index.js -o peac2h-embedded
# Create an archive named after the OS

tar -czf "linux.tar.gz"  peac2h-embedded-linux db.json public
zip windows.zip peac2h-embedded-win.exe db.json public

## Cleanup 
rm db.json 
rm -rf public
rm peac2h-embedded-win.exe peac2h-embedded-linux

# run the script for windows and then linux
# package "win"
# package "linux"