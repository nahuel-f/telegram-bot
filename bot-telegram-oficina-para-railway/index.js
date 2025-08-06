const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const schedule = require('node-schedule');

const token = process.env.BOT_TOKEN;
const userId = parseInt(process.env.USER_ID, 10);
const dbPath = './contador.json';

let diasTotales = 96;
if (fs.existsSync(dbPath)) {
  const data = JSON.parse(fs.readFileSync(dbPath));
  diasTotales = data.dias;
}

const bot = new TelegramBot(token, { polling: true });

bot.sendMessage(userId, 'Hola, soy Merlino Bot. Seguimos con el countdown de oficina');

// De lunes a viernes a las 11:00 AM hora del servidor
schedule.scheduleJob('0 11 * * 1-5', () => {
  bot.sendMessage(userId, '¿Fuiste a la oficina hoy? Responde "sí" o "no".');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text.toLowerCase();

  if (chatId !== userId) return;

  if (texto === 'sí' || texto === 'si') {
    diasTotales--;
    fs.writeFileSync(dbPath, JSON.stringify({ dias: diasTotales }));
    bot.sendMessage(chatId, `¡Perfecto! Te quedan ${diasTotales} días de oficina.`);
  } else if (texto === 'no') {
    bot.sendMessage(chatId, `¡Ok! No se descuenta ningún día. Siguen siendo ${diasTotales}.`);
  } else if (texto === 'status') {
    bot.sendMessage(chatId, `Te quedan ${diasTotales} días de oficina.`);
  } else {
    bot.sendMessage(chatId, 'Habla con Merlín real, yo solo soy un bot.');
  }
});
