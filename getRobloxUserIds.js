// Script para obtener userId de Roblox a partir de nombres de usuario
// Uso: node getRobloxUserIds.js nombre1 nombre2 nombre3 ...

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getUserIds(usernames) {
  const response = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames })
  });
  const data = await response.json();
  if (data.data) {
    data.data.forEach(user => {
      console.log(`${user.name}: ${user.id}`);
    });
  } else {
    console.error('Error en la respuesta:', data);
  }
}

const usernames = process.argv.slice(2);
if (usernames.length === 0) {
  console.log('Uso: node getRobloxUserIds.js nombre1 nombre2 nombre3 ...');
  process.exit(1);
}

getUserIds(usernames); 