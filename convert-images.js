const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'assets');

const images = [
  { input: 'background01.jpg',              quality: 80 },
  { input: 'bkg-servicos.jpg',              quality: 80 },
  { input: 'drone-predio.jpg',              quality: 82 },
  { input: 'equipe.png',                    quality: 82 },
  { input: 'escrituracao-contabil-card.png',quality: 82 },
  { input: 'apple-touch-icon.png',          quality: 90 },
];

(async () => {
  for (const img of images) {
    const inputPath  = path.join(assetsDir, img.input);
    const outputName = img.input.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(assetsDir, outputName);

    try {
      const info = await sharp(inputPath)
        .webp({ quality: img.quality, effort: 6 })
        .toFile(outputPath);

      const before = fs.statSync(inputPath).size;
      const after  = fs.statSync(outputPath).size;
      const saved  = (((before - after) / before) * 100).toFixed(1);
      console.log(`✓ ${img.input} → ${outputName}  |  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (−${saved}%)`);
    } catch (err) {
      console.error(`✗ ${img.input}: ${err.message}`);
    }
  }

  // servicos subdir
  const servicosDir = path.join(assetsDir, 'servicos');
  const servicosFiles = fs.readdirSync(servicosDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  for (const file of servicosFiles) {
    const inputPath  = path.join(servicosDir, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(servicosDir, outputName);
    try {
      const info = await sharp(inputPath).webp({ quality: 85, effort: 6 }).toFile(outputPath);
      const before = fs.statSync(inputPath).size;
      const after  = fs.statSync(outputPath).size;
      const saved  = (((before - after) / before) * 100).toFixed(1);
      console.log(`✓ servicos/${file} → ${outputName}  |  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (−${saved}%)`);
    } catch (err) {
      console.error(`✗ servicos/${file}: ${err.message}`);
    }
  }

  console.log('\nConversão concluída!');
})();
