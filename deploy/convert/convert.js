const fs = require('fs');
const program = require('commander');

program
  .version('0.1.0')
  .arguments('<filename>')
  .action((filename) => {
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
  });

program.parse(process.argv);

// Report CLI parameters error
if (typeof program.args[0] === 'undefined') {
  console.error('No filename given!');
  process.exit(1);
}