const url = require('url');
const config = require('config');
const uri = 'mongodb://vanbungkring:merdeka123>@cluster0-shard-00-00-e6knv.mongodb.net:27017,cluster0-shard-00-01-e6knv.mongodb.net:27017,cluster0-shard-00-02-e6knv.mongodb.net:27017/PEMILU?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const uriObj = url.parse(uri);

if (!uri) {
  throw new Error(
    'You need to provide the connection string. ' +
    'You can open "models/connection-string.js" and export it or use the "setUri" command.'
  );
}

if (uriObj.protocol !== 'mongodb:') {
  throw new Error('Must be a mongodb URI');
}
if (!uriObj.host || !uriObj.path) {
  throw new Error('Improperly formatted URI');
}
