const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync("storyapp", 10);
console.log("HASH:" + hash);
