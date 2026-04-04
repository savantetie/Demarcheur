require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const u = await User.findOneAndUpdate(
    { email: 'lamotivation224@gmail.com' },
    { role: 'admin' },
    { new: true }
  );
  console.log(u ? 'Admin OK: ' + u.nom : 'Utilisateur non trouve');
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
