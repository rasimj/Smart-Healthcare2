import 'dotenv/config';

console.log('Loaded Environment Variables:');
console.log(`ADMIN_EMAIL: [${process.env.ADMIN_EMAIL}]`);
console.log(`ADMIN_PASSWORD: [${process.env.ADMIN_PASSWORD}]`);

const email = 'admin@prescripto.com';
const password = 'qwerty123';

console.log(`\nComparison:`);
console.log(`Email Match: ${process.env.ADMIN_EMAIL === email}`);
console.log(`Password Match: ${process.env.ADMIN_PASSWORD === password}`);
