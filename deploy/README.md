# Building and deployment


You can build all the binaries and zip 
with the `build.sh` script. 

Below are the manual steps. 

## Build the app 

``` bash
cd .. 
yarn install
yarn build
```

## Build the binaries 

``` bash
## Install PKG globally (may need admin access)
npm install -g pkg
## Get the dependencies
yarn install
## Build the binary for multiple OS 
pkg -t node16-win-x64,node16-linux-x64 index.js -o peac2h-embedded
```

## Run the app 

To run the app you need: 

* The binary build at the previous step. 
* The build web application in `../out` folder. 
* A `db.json` file built using the `convert` script. 

You can try your binary like this : 

``` bash 
# Copy the folder and the file
cp -r ../out ./public
cp ../db.json ./db.json
./peac2h-embedded-linux 
```
