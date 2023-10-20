const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const token = "6362622832:AAHscQAoWavxQR2fN098Piaolsyj6B-hYQQ";

const dataFilePath = "user_data.json";
const bot = new TelegramBot(token, { polling: true });

let userData = {};

if (fs.existsSync(dataFilePath)) {
  const data = fs.readFileSync(dataFilePath, "utf-8");
  userData = JSON.parse(data);
}

function saveDataToFile() {
  fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2), "utf-8");
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Ласкаво просимо! Виберіть дію:", {
    reply_markup: {
      keyboard: [["+1"], ["/get_curse_count"], ["/get_total_curse_count"]],
      one_time_keyboard: true,
    },
  });

  if (!userData[chatId]) {
    userData[chatId] = { curseCount: 0 };
    saveDataToFile();
  }
});

bot.onText(/\+1/, (msg) => {
  const chatId = msg.chat.id;

  if (userData[chatId]) {
    userData[chatId].curseCount++;
    saveDataToFile();
    bot.sendMessage(
      chatId,
      `Загальна кількість матюків: ${userData[chatId].curseCount}`
    );
  }
});

bot.onText(/\/get_curse_count/, (msg) => {
  const chatId = msg.chat.id;

  if (userData[chatId]) {
    bot.sendMessage(
      chatId,
      `Загальна кількість матюків: ${userData[chatId].curseCount}`
    );
  }
});
bot.onText(/\/get_total_curse_count/, (msg) => {
  const chatId = msg.chat.id;

  const userCurseCounts = Object.entries(userData).map(([userId, user]) => ({
    userId,
    curseCount: user.curseCount,
  }));

  let message = "Загальна кількість матюків користувачів:\n";
  userCurseCounts.forEach(({ userId, curseCount }) => {
    message += `Користувач ID ${userId}: ${curseCount}\n`;
  });

  bot.sendMessage(chatId, message);
});
