#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

function getNextAdrNumber() {
  const adrDir = path.join(__dirname, '..', 'adr');
  
  if (!fs.existsSync(adrDir)) {
    fs.mkdirSync(adrDir, { recursive: true });
    return '0001';
  }
  
  const files = fs.readdirSync(adrDir)
    .filter(file => file.match(/^\d{4}-.*\.md$/))
    .map(file => parseInt(file.substring(0, 4)))
    .filter(num => !isNaN(num));
    
  const maxNumber = files.length > 0 ? Math.max(...files) : 0;
  return (maxNumber + 1).toString().padStart(4, '0');
}

function createAdr(title) {
  if (!title) {
    console.error('Error: Debes proporcionar un título para el ADR');
    console.log('Uso: yarn adr:new "Título del ADR"');
    process.exit(1);
  }

  const number = getNextAdrNumber();
  const slug = slugify(title);
  const filename = `${number}-${slug}.md`;
  const date = new Date().toISOString().split('T')[0];
  
  const templatePath = path.join(__dirname, '..', 'adr', '0000-template.md');
  const template = fs.readFileSync(templatePath, 'utf8');
  
  const content = template
    .replace('[NÚMERO]', number)
    .replace('[TÍTULO CORTO DEL PROBLEMA Y SOLUCIÓN]', title)
    .replace('[FECHA]', date);
  
  const adrPath = path.join(__dirname, '..', 'adr', filename);
  fs.writeFileSync(adrPath, content);
  
  console.log(`✅ ADR creado: adr/${filename}`);
  console.log(`📝 Título: ${title}`);
  console.log(`📅 Fecha: ${date}`);
  console.log(`🔢 Número: ${number}`);
}

const title = process.argv[2];
createAdr(title);
