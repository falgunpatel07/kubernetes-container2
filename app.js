// container2/app.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
app.use(bodyParser.json());
// test ci/cd container2
// Configuration
const PORT = process.env.PORT || 3001;
const STORAGE_DIR = process.env.STORAGE_DIR || './storage'; // This will map to PV in k8s

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

app.post('/calculate-sum', (req, res) => {
  const { file, product } = req.body;

  // Validate input
  if (!file) {
    return res.status(400).json({
      file: null,
      error: "Invalid JSON input."
    });
  }

  const filePath = path.join(STORAGE_DIR, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      file: file,
      error: "File not found."
    });
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      // 🔥 Return correct error if CSV format is wrong
      return res.status(400).json({
        file: file,
        error: "Input file not in CSV format."
      });
    }

    let sum = 0;
    records.forEach(record => {
      if (record.product && record.product.trim() === product) {
        sum += parseInt(record.amount) || 0;
      }
    });

    // ✅ Return correct response with sum
    return res.status(200).json({
      file: file,
      sum: sum
    });

  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    return res.status(500).json({
      file: file,
      error: "Error processing file."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Container 2 listening on port ${PORT}`);
});