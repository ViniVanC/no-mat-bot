const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = "6362622832:AAHscQAoWavxQR2fN098Piaolsyj6B-hYQQ";
const mockApiUrl = "https://65338d61d80bd20280f69256.mockapi.io/users"; // Вставте URL свого MockAPI

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.from.id; // Отримання ідентифікатора користувача (user ID)
  const username = msg.from.username; // Отримання тегу користувача (username)
  const firstName = msg.from.first_name; // Отримання імені користувача (first name)

  bot.sendMessage(chatId, "Ласкаво просимо! Виберіть дію:", {
    reply_markup: {
      keyboard: [["+1"], ["/get_curse_count"], ["/get_all_users_curse_count"]],
      one_time_keyboard: true,
    },
  });

  // Перевірка наявності користувача на MockAPI за `userId`
  checkUserExists(chatId)
    .then((userExists) => {
      if (!userExists) {
        // Якщо користувача не існує, додамо його на MockAPI
        addUserToMockAPI(chatId, username, firstName);
      }
    })
    .catch((error) => {
      console.error("Помилка перевірки користувача:", error);
    });
});

bot.onText(/\+1/, (msg) => {
  const chatId = msg.chat.id;

  // Збільшення лічильника матюків користувача на MockAPI за `userId`
  incrementUserCurseCount(chatId)
    .then((curseCount) => {
      bot.sendMessage(chatId, `Загальна кількість матюків: ${curseCount}`);
    })
    .catch((error) => {
      console.error("Помилка збільшення лічильника матюків:", error);
    });
});

bot.onText(/\/get_curse_count/, (msg) => {
  const chatId = msg.chat.id;

  // Отримання лічильника матюків користувача з MockAPI за `userId`
  getUserCurseCount(chatId)
    .then((curseCount) => {
      bot.sendMessage(chatId, `Загальна кількість матюків: ${curseCount}`);
    })
    .catch((error) => {
      console.error("Помилка отримання лічильника матюків:", error);
    });
});

bot.onText(/\/get_all_users_curse_count/, (msg) => {
  const chatId = msg.chat.id;

  // Отримання кількості матюків усіх користувачів з MockAPI
  getAllUsersCurseCount()
    .then((users) => {
      if (users.length === 0) {
        bot.sendMessage(chatId, "Наразі немає жодного користувача.");
      } else {
        const responseText = users
          .map((user) => {
            return `Користувач \*${user.firstName}\* має ${user.curseCount} матюків.`;
          })
          .join("\n");
        bot.sendMessage(chatId, responseText, { parse_mode: "Markdown" });
      }
    })
    .catch((error) => {
      console.error("Помилка отримання кількості матюків користувачів:", error);
    });
});

// Функція для отримання кількості матюків усіх користувачів на MockAPI
function getAllUsersCurseCount() {
  return axios.get(mockApiUrl).then((response) => {
    const users = response.data;
    return users;
  });
}

function checkUserExists(userId) {
  return axios
    .get(`${mockApiUrl}?userId=${userId}`)
    .then((response) => response.data.length > 0)
    .catch(() => false);
}

function addUserToMockAPI(userId, username, firstName) {
  return axios.post(mockApiUrl, {
    userId,
    username: username,
    firstName: firstName,
    curseCount: 0,
  });
}

function incrementUserCurseCount(userId) {
  return axios.get(`${mockApiUrl}?userId=${userId}`).then((response) => {
    const userData = response.data[0];
    userData.curseCount++;
    return axios
      .put(`${mockApiUrl}/${userData.id}`, userData)
      .then(() => userData.curseCount);
  });
}

function getUserCurseCount(userId) {
  return axios
    .get(`${mockApiUrl}?userId=${userId}`)
    .then((response) => response.data[0].curseCount);
}

// function getTotalCurseCount() {
//   return axios.get(mockApiUrl).then((response) => {
//     const users = response.data;
//     return users.reduce((total, user) => total + user.curseCount, 0);
//   });
// }
