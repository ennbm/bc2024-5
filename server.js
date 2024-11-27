const express = require('express');
const { Command } = require('commander');
const fs = require('fs');

const app = express();
const program = new Command();

// Налаштування команд
program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <cache>', 'Шлях до директорії з кешованими файлами')
  .parse(process.argv);

const { host, port, cache } = program.opts();

// Перевірка існування директорії кешу
if (!fs.existsSync(cache)) {
  console.error(`Помилка: Директорія "${cache}" не існує.`);
  process.exit(1);
}

if (!fs.statSync(cache).isDirectory()) {
  console.error(`Помилка: "${cache}" не є директорією.`);
  process.exit(1);
}

// Маршрути
app.get('/', (req, res) => {
  res.send('Сервер працює! Перевірте налаштування.');
});

// Запуск сервера
app.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
