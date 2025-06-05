const { getUsers, addToAdmins, getForms } = require('./db')
const { Bot } = require('grammy');
require('dotenv').config();

// Initialize the bot with your token from environment variables
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const commandPassword = process.env.TELEGRAM_ADMIN_PASSWORD;
// Store admin chat IDs (you can add multiple admins)
const adminChatIds = new Set();


function formatTelegramMessage(formData) {
    return `
<b>New Form Submission</b>

<u>Name:</u> ${formData.name || 'N/A'}
<u>Email:</u> ${formData.email || 'N/A'}
<u>Phone number:</u> ${formData.phone || 'N/A'}

<i>Received at:</i> ${new Date().toLocaleString()}
    `;
}

// Command to register admin chat ID
bot.command('start', async (ctx) => {
    await ctx.reply('To be an admin enter the password.');
});
bot.command(commandPassword, async (ctx) => {
  const chatId = ctx.chat.id;
  await addToAdmins(chatId);
  adminChatIds.add(chatId);
  await ctx.reply('Now you are an admin');
})
bot.command('forms', async (ctx) => {
    const forms = await getForms();
    forms.forEach((form) => ctx.reply(formatTelegramMessage(form), { parse_mode: 'HTML' }))
})

// Function to send message to all admins
async function sendToAdmins(message) {
    for (const chatId of adminChatIds) {
        try {
            await bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } catch (error) {
            console.error(`Failed to send message to admin ${chatId}:`, error);
        }
    }
}
async function setActiveAdmins() {
  try {
    const users = await getUsers();
    if (!users.length) {
      console.log('No acive users');
      return;
    }
    for (const { tg_id } of users) {
      adminChatIds.add(tg_id);
    }
    console.log('Active users are set')
  } catch {
    console.log('smthng went wrong')
  }
}

// Start the bot
async function startTgBot() {
  if (process.env.NODE_ENV !== 'test') {
      bot.start();
      console.log('Telegram bot is running...');
      await setActiveAdmins();
  }
}

module.exports = {
    startTgBot,
    bot,
    sendToAdmins,
    formatTelegramMessage
};
