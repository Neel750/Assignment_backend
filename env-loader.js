const env = require('dotenv').config().parsed

if(!env){
    console.log('ERROR:Environment not loaded')
    process.exit();
}
module.exports = env