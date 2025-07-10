#!/usr/bin/node

const fs = require('fs');

const path = require('path');

const folderPath = '../lib';
const ignore = ['manufacturers.json', 'weapons.json', 'systems.json', 'mods.json'];

const ignoreWords = ['{VAL}', '({VAL})', '{VAL}+', 'HP', 'GRIT', 'SP', 'AP', '(AP)'];

function decapitalize() {
  function decap(string) {
    const words = string.split(' ');
    const capitalizedWords = words.map((word) => {
      if (ignoreWords.some((x) => x === word)) return word;
      else if (word === word.toUpperCase()) {
        return word.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
      } else {
        return word;
      }
    });
    const capitalizedString = capitalizedWords.join(' ');
    return capitalizedString;
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }

    files.forEach((file) => {
      if (ignore.some((x) => x === file)) return;
      const filePath = path.join(folderPath, file);
      console.log(filePath);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', file, err);
          return;
        }

        try {
          let fixed = 0;
          const jsonObject = JSON.parse(data);
          if (Array.isArray(jsonObject)) {
            jsonObject.forEach((e) => {
              if (e.name) {
                if (e.name.includes('ERR:')) return;
                if (e.name === e.name.toUpperCase()) {
                  const decapped = decap(e.name);
                  if (e.name !== decapped) {
                    // console.log('decapped:', e.name, decapped);
                    e.name = decapped;
                    fixed++;
                  }
                }
              }
            });
            fs.writeFile(filePath, JSON.stringify(jsonObject, null, 2), (err) => {
              if (err) {
                console.error('Error writing file:', file, err);
                return;
              }
            });

            console.log(`fixed: ${fixed} in file: ${file}`);
          }
        } catch (err) {
          console.error('Error parsing JSON in file:', file, err);
        }
      });
    });
  });
}

function expandEffect() {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      if (path.extname(file) === '.json') {
        const filePath = path.join(folderPath, file);

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${file}:`, err);
            return;
          }

          try {
            let jsonData = JSON.parse(data);
            let modified = false;

            jsonData = jsonData.map((obj) => {
              if (obj.hasOwnProperty('effect') && typeof obj.effect === 'string') {
                obj.effect = { description: obj.effect };
                modified = true;
              }
              return obj;
            });

            if (modified) {
              fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                  console.error(`Error writing file ${file}:`, err);
                } else {
                  console.log(`Updated ${file}`);
                }
              });
            }
          } catch (parseError) {
            console.error(`Error parsing JSON in file ${file}:`, parseError);
          }
        });
      }
    });
  });
}

// run

expandEffect();
