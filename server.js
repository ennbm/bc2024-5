const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');  // Модуль для роботи з файлами
const app = express();

// Файл для збереження нотаток
const NOTES_FILE = './notes.json';

// Налаштовуємо body-parser для отримання даних форми
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Для обробки JSON запитів

// Налаштування multer для збереження файлів (якщо потрібно)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Функція для зчитування нотаток з файлу
const readNotesFromFile = () => {
  if (fs.existsSync(NOTES_FILE)) {
    const data = fs.readFileSync(NOTES_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Функція для запису нотаток у файл
const writeNotesToFile = (notes) => {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
};

// Обробка GET запиту для /notes/<ім’я нотатки>
app.get('/notes/:name', (req, res) => {
  const notes = readNotesFromFile();
  const note = notes.find(n => n.name === req.params.name);
  if (!note) {
    return res.status(404).send('Note not found');
  }
  res.send(note.text);
});

// Обробка PUT запиту для /notes/<ім’я нотатки>
app.put('/notes/:name', (req, res) => {
  const notes = readNotesFromFile();
  const note = notes.find(n => n.name === req.params.name);
  if (!note) {
    return res.status(404).send('Note not found');
  }
  note.text = req.body.note; // Замінюємо текст
  writeNotesToFile(notes);
  res.send('Note updated');
});

// Обробка DELETE запиту для /notes/<ім’я нотатки>
app.delete('/notes/:name', (req, res) => {
  const notes = readNotesFromFile();
  const index = notes.findIndex(n => n.name === req.params.name);
  if (index === -1) {
    return res.status(404).send('Note not found');
  }
  notes.splice(index, 1); // Видаляємо нотатку
  writeNotesToFile(notes);
  res.send('Note deleted');
});

// Обробка GET запиту для /notes (виведення списку нотаток у HTML)
app.get('/notes', (req, res) => {
  const notes = readNotesFromFile();
  if (notes.length === 0) {
    return res.status(200).send('No notes found');
  }

  let notesList = '<h1>Список нотаток:</h1><ul>';
  notes.forEach(note => {
    notesList += `
      <li>
        <strong>${note.name}</strong>: ${note.text}
      </li>
    `;
  });
  notesList += '</ul>';

  res.status(200).send(notesList); // Повертаємо HTML зі списком нотаток
});

// Обробка POST запиту для /write
app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;

  if (!note_name || !note) {
    return res.status(400).send('Missing required fields');
  }

  const notes = readNotesFromFile();
  if (notes.some(n => n.name === note_name)) {
    return res.status(400).send('Note already exists');
  }

  // Додаємо нову нотатку в масив
  notes.push({ name: note_name, text: note });
  writeNotesToFile(notes);
  res.status(201).send('Note created');
});

// Обробка GET запиту для /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
  res.send(`
    <form action="/write" method="POST">
      <label for="note_name">Note Name:</label>
      <input type="text" id="note_name" name="note_name" required><br>

      <label for="note">Note:</label>
      <input type="text" id="note" name="note" required><br>

      <button type="submit">Submit</button>
    </form>
  `);
});

// Запуск сервера на порту 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
