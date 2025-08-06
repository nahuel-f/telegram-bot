const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const schedule = require('node-schedule');

const token = process.env.BOT_TOKEN;
const userId = parseInt(process.env.USER_ID, 10);
const dbPath = './contador.json';

let diasTotales = 97;
if (fs.existsSync(dbPath)) {
  const data = JSON.parse(fs.readFileSync(dbPath));
  diasTotales = data.dias;
}

const bot = new TelegramBot(token, { polling: true });

bot.sendMessage(userId, 'Hola, soy Merlino Bot. Seguimos con el countdown de oficina');

// De lunes a viernes a las 11:00 AM hora del servidor
schedule.scheduleJob('0 14 * * 1-5', () => {
  bot.sendMessage(userId, '¿Fuiste a la oficina hoy? Responde "/sí" o "/no".');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text.toLowerCase();
  const hoy = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

  if (chatId !== userId) return;

  let ultimaFecha = null;
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath));
    diasTotales = data.dias;
    ultimaFecha = data.ultimaActualizacion;
  }

  if (texto === '/sí' || texto === '/si') {
    if (ultimaFecha === hoy) {
      bot.sendMessage(chatId, 'Ya registraste que fuiste hoy. Si querés modificar días, usá /add o /less.');
    } else {
      diasTotales--;
      fs.writeFileSync(dbPath, JSON.stringify({ dias: diasTotales, ultimaActualizacion: hoy }));
      bot.sendMessage(chatId, `¡Perfecto! Te quedan ${diasTotales} días de oficina.`);
    }
  } else if (texto === '/no') {
    bot.sendMessage(chatId, `¡Ok! No se descuenta ningún día. Siguen siendo ${diasTotales}.`);
  } else if (texto === '/status') {
    bot.sendMessage(chatId, `Te quedan ${diasTotales} días de oficina.`);
  } else if (texto === '/add') {
    diasTotales++;
    fs.writeFileSync(dbPath, JSON.stringify({ dias: diasTotales, ultimaActualizacion: ultimaFecha }));
    bot.sendMessage(chatId, `Sumaste un día. Ahora tenés ${diasTotales} días de oficina.`);
  } else if (texto === '/less') {
    diasTotales--;
    fs.writeFileSync(dbPath, JSON.stringify({ dias: diasTotales, ultimaActualizacion: ultimaFecha }));
    bot.sendMessage(chatId, `Restaste un día. Ahora te quedan ${diasTotales} días de oficina.`);
  } else {
    bot.sendMessage(chatId, 'Habla con Merlín real, yo solo soy un bot.');
  }
});
