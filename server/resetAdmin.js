require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const NOUVEAU_MOT_DE_PASSE = 'Admin2024!';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: 'lamotivation224@gmail.com' }).select('+motDePasse');
  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    process.exit(1);
  }

  // On set directement sans passer par le hook pre-save
  user.motDePasse = NOUVEAU_MOT_DE_PASSE; // le hook va le hasher
  user.role = 'admin';
  user.actif = true;
  user.emailVerifie = true;
  user.banniere = false;
  await user.save();

  console.log('✅ Compte admin réinitialisé pour :', user.nom);
  console.log('📧 Email :', user.email);
  console.log('🔑 Mot de passe :', NOUVEAU_MOT_DE_PASSE);
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
