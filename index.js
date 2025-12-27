import fetch from 'node-fetch';

const API_URL = 'https://visas-be.tlscontact.com/services/customerservice/api/tls/appointment/dz/dzALG2be/table?client=be&formGroupId=1390207&appointmentType=Loisirs&appointmentStage=appointment';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function checkSlots() {
  try {
    const res = await fetch(API_URL);
    
    // Check if response is OK
    if (!res.ok) {
      console.error(`❌ API returned error: ${res.status} ${res.statusText}`);
      return;
    }
    
    // Check content type before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ API returned unexpected content type: ${contentType}`);
      console.error('💡 The API might require authentication or the endpoint has changed.');
      console.error('💡 Try using the full bot (npm run bot) which handles session/login.');
      return;
    }
    
    const data = await res.json();

    const slots = [];
    for (const date in data) {
      for (const hour in data[date]) {
        if (data[date][hour] > 0) {
          slots.push(`${date} à ${hour}`);
        }
      }
    }

    if (slots.length > 0) {
      const msg = `🟢 Créneaux disponibles :\n${slots.join('\n')}`;
      console.log(msg);
      await sendTelegram(msg);
    } else {
      console.log(`[${new Date().toISOString()}] Aucun créneau trouvé.`);
    }
  } catch (err) {
    console.error('Erreur lors de la vérification :', err.message);
    if (err.message.includes('Unexpected token')) {
      console.error('\n💡 The API returned HTML instead of JSON. This usually means:');
      console.error('   1. The API requires authentication (login)');
      console.error('   2. You need to use the full bot: npm run bot');
      console.error('   3. The bot will handle session cookies and login automatically\n');
    }
  }
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
}

// Lancement initial
checkSlots();

// Vérifie toutes les 5 minutes
setInterval(checkSlots, 5 * 60 * 1000);
