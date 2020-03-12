const fs = require('fs');
configPath = __dirname + '/config.json';
let parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

exports.storageConfig = parsed;