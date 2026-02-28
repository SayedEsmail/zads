const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:4000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '01222222222',
        password: 'parent123',
        json: true
      })
    });
    const text = await res.text();
    console.log(res.status);
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
run();
