const fs = require('fs');

if(process.argv.length < 3) {
  console.error('No filename given. Use like this: node convert.js file.json');
  process.exit(1);
}

const filename = process.argv[2];

console.log('Reading file', filename);

fs.readFile(filename, 'utf8', (err, fileData) => {
  if (err) throw err;

  console.log('Checking if db.json already exists');
  fs.stat('db.json', (err, stat) => {
    if (err == null) {
      console.error('The file db.json already exists!');
      process.exit(1);
    } else {
      console.log('Parsing JSON data from file');
      const data = JSON.parse(fileData);
      data["id"] = "imported";
    
      const finalData = {
        "studies": [data],
        "subjects": []
      };

      console.log('Writing to db.json');
      fs.writeFile("db.json", JSON.stringify(finalData, null, 2), 'utf8', (err) => {
        if (err) throw err;

        console.log('Successfully wrote to db.json');
      });
    }
  });
});
