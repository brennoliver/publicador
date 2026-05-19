/**
 * Gera bcrypt hash de uma senha para usar nas variáveis de ambiente.
 * Uso: node scripts/hash-password.js <senha>
 */
import bcrypt from 'bcryptjs';

const pass = process.argv[2];
if (!pass) {
  console.error('Uso: node scripts/hash-password.js <senha>');
  process.exit(1);
}

const hash = await bcrypt.hash(pass, 12);
console.log('\nHash gerado:');
console.log(hash);
console.log('\nCopie esse valor para a variável de ambiente correspondente.');
