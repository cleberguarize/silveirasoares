// Script para aplicar otimizações de performance avançadas em todos os HTMLs
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  { file: 'index.html',             heroImage: 'assets/background01.webp' },
  { file: 'quem-somos.html',        heroImage: 'assets/drone-predio.webp' },
  { file: 'servicos.html',          heroImage: 'assets/bkg-servicos.webp' },
  { file: 'conteudo.html',          heroImage: 'assets/drone-predio.webp' },
  { file: 'trabalhe-conosco.html',  heroImage: 'assets/drone-predio.webp' },
  { file: 'politicas-de-privacidade.html', heroImage: null },
  { file: 'termos-de-uso.html',     heroImage: null },
];

for (const { file, heroImage } of htmlFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Otimizar Google Fonts com media="print" trick (não bloqueia renderização)
  //    Substituir rel="stylesheet" por rel="preload" + onload trick para fontes
  content = content.replace(
    /<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" rel="stylesheet"\/>/g,
    (match, href) => {
      return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"/>\n<noscript><link rel="stylesheet" href="${href}"/></noscript>`;
    }
  );

  // 2. Adicionar preload para imagem hero LCP
  if (heroImage) {
    const preloadTag = `<link rel="preload" as="image" href="${heroImage}" fetchpriority="high"/>`;
    // Inserir após charset meta
    if (!content.includes(`href="${heroImage}"`)) {
      content = content.replace(
        '<meta charset="utf-8"/>',
        `<meta charset="utf-8"/>\n${preloadTag}`
      );
    } else if (!content.includes(`rel="preload" as="image"`)) {
      content = content.replace(
        '<meta charset="utf-8"/>',
        `<meta charset="utf-8"/>\n${preloadTag}`
      );
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file} — otimizado`);
  } else {
    console.log(`  ${file} — sem alterações`);
  }
}

console.log('\n✓ Otimizações de performance aplicadas!');
