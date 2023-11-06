## Convert experimental study to db.json 

You have three ways to convert the file to a 
valid `db.json`. 


### Ruby 

Tested with Ruby 3.1.  Standard Ruby code, no dependency.

```bash 
ruby todb.rb study.json 
```

### Javascript 

Tested with NodeJS 16. Standard NodeJS code, no dependency.

```bash
node convert.js study.json 
```

### Binary from Javascript 


```bash
./convertToDb study.json 
``` 

Build the binary yourself: 

``` 
pkg -t node16-win-x64,node16-linux-x64 convert.js -o convertToDb
``` 
