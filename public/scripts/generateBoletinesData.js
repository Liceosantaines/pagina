// scripts/generateBoletinesData.js

const fs   = require('fs');
const path = require('path');

const periodos = {
  "1": "Periodo I",
  "2": "Periodo II",
  "3": "Periodo III",
  "4": "Periodo IV"
};
const niveles  = {
  parvulos:     "Párvulos",
  "pre-jardin": "Pre-jardín",
  jardin:       "Jardín",
  transicion:   "Transición",
  primero:      "Primero",
  segundo:      "Segundo",
  tercero:      "Tercero",
  cuarto:       "Cuarto",
  quinto:       "Quinto"
};

function nombreDesdeArchivo(filename) {
  const base = path.basename(filename, '.pdf');
  return base
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const data = { periodos, niveles, boletines: {} };

console.log('🚀 Generando boletines-data.json...');
console.log('• __dirname:', __dirname);
console.log('• process.cwd():', process.cwd());

for (let pid of Object.keys(periodos)) {
  data.boletines[pid] = {};
  const perDir = path.resolve(__dirname, '../boletines', 'periodo' + pid);
  console.log(`\n→ Periodo ${pid}: buscando en ${perDir}`);
  for (let slug of Object.keys(niveles)) {
    const nivelDir = path.join(perDir, slug);
    data.boletines[pid][slug] = [];

    if (!fs.existsSync(nivelDir)) {
      console.warn(`   ⚠️ Directorio NO existe: ${nivelDir}`);
      continue;
    }
    console.log(`   📂 Nivel ${slug}: existe, leyendo PDFs…`);

    fs.readdirSync(nivelDir)
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .forEach(file => {
        const fullPath = path.join(nivelDir, file);
        const stat     = fs.statSync(fullPath);

        // tamaño legible
        let size = (stat.size / (1024 * 1024)).toFixed(2) + ' MB';
        if (stat.size < 1024 * 1024) size = (stat.size / 1024).toFixed(2) + ' KB';

        const nombre = nombreDesdeArchivo(file);
        console.log(`     ✔ PDF encontrado: ${file} → nombre="${nombre}", size=${size}`);

        data.boletines[pid][slug].push({
          nombre,
          file:   path.posix.join('boletines','periodo'+pid,slug,file),
          size
        });
      });

    console.log(
      `   📑 Total en ${slug}:`,
      data.boletines[pid][slug].length
    );
  }
}

// Escribe (o sobreescribe) el JSON en la raíz
const outPath = path.resolve(__dirname, '../boletines-data.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ ¡Listo! ${outPath} actualizado.`);
