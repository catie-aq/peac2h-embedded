#!/bin/bash

# save the current and base directories
baseDir=$(pwd)


# define the function for the build and package steps
# checking if pkg is already installed
command -v pkg >/dev/null 2>&1 || { echo >&2 "PKG is required but it's not installed. Aborting."; exit 1; }

# Get back to the current folder if not already
cd ${baseDir}

## Go to parent directory 
cd ${baseDir}/../
yarn build

# Get back to the current folder
cd "${baseDir}"

# Copy the folder and the file
cp -r ../out ./public
cp ../db.json ./db.json

## Get the dependencies
yarn install
# Compile the exe for index.js with PKG

# Build windows and linux binary for JSON-server
pkg -t node16-win-x64,node16-linux-x64 index.js -o peac2h-embedded

# Build windows and linux binary for converter
# pkg -t node16-win-x64,node16-linux-x64 convert.js -o study-to-db

rm linux.tar.gz
rm windows.zip

tar -czf "linux.tar.gz" peac2h-embedded-linux db.json public
zip -r windows.zip peac2h-embedded-win.exe db.json public

## Cleanup 
rm db.json 
rm -rf public
rm peac2h-embedded-win.exe peac2h-embedded-linux
