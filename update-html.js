// Script para atualizar todos os HTMLs: WebP + lazy loading + fetchpriority + numero de clientes
// Execute na pasta do projeto: node update-html.js

const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html',
  'quem-somos.html',
  'servicos.html',
  'conteudo.html',
  'trabalhe-conosco.html',
  'politicas-de-privacidade.html',
  'termos-de-uso.html',
];

// Mapeamento de imagens para converter (original → webp)
const imageReplacements = [
  // Imagens grandes - converter para webp
  { from: 'assets/background01.jpg',               to: 'assets/background01.webp' },
  { from: 'assets/bkg-servicos.jpg',               to: 'assets/bkg-servicos.webp' },
  { from: 'assets/drone-predio.jpg',               to: 'assets/drone-predio.webp' },
  { from: 'assets/equipe.png',                     to: 'assets/equipe.webp' },
  { from: 'assets/escrituracao-contabil-card.png', to: 'assets/escrituracao-contabil-card.webp' },
  // servicos/
  { from: 'assets/servicos/escrituracao-contabil.png', to: 'assets/servicos/escrituracao-contabil.webp' },
  { from: 'assets/servicos/gestao-tributaria.png',     to: 'assets/servicos/gestao-tributaria.webp' },
  { from: 'assets/servicos/escrita-fiscal.png',        to: 'assets/servicos/escrita-fiscal.webp' },
  { from: 'assets/servicos/departamento-pessoal.png',  to: 'assets/servicos/departamento-pessoal.webp' },
  { from: 'assets/servicos/gestao-societaria.png',     to: 'assets/servicos/gestao-societaria.webp' },
  { from: 'assets/servicos/contabilidade.png',         to: 'assets/servicos/contabilidade.webp' },
  { from: 'assets/servicos/planejamento-estrategico.png', to: 'assets/servicos/planejamento-estrategico.webp' },
];

// Imagens de hero (LCP) que devem ter fetchpriority="high" e preload
// As demais devem ter loading="lazy"
const heroImages = [
  'assets/background01.webp',
  'assets/bkg-servicos.webp',
  'assets/drone-predio.webp',
];

// Imagens que devem ter loading="lazy" explicitamente
const lazyImages = [
  'assets/equipe.webp',
  'assets/escrituracao-contabil-card.webp',
];

let totalChanges = 0;

for (const file of htmlFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Substituir extensões de imagem
  for (const r of imageReplacements) {
    content = content.split(r.from).join(r.to);
  }

  // 2. Fixar numero de clientes: +500 → +1330 em quem-somos.html
  if (file === 'quem-somos.html') {
    content = content.replace(/>(\+500)</g, '>+1.330<');
    // Também corrigir se estiver sem chevron
    content = content.replace(/\+500\b/g, '+1.330');
  }

  // 3. Para imagens lazy não-hero, garantir loading="lazy"
  // Adicionar loading="lazy" nas img que não são hero e não têm o atributo
  content = content.replace(
    /<img([^>]*?)(assets\/equipe\.webp|assets\/escrituracao-contabil-card\.webp|assets\/servicos\/[^"']+\.webp)([^>]*?)>/g,
    (match, before, src, after) => {
      if (match.includes('loading=')) return match;
      return `<img${before}${src}${after} loading="lazy">`;
    }
  );

  // 4. Para imagens hero: garantir fetchpriority="high" e loading="eager"
  content = content.replace(
    /<img([^>]*?)(assets\/background01\.webp|assets\/bkg-servicos\.webp|assets\/drone-predio\.webp)([^>]*?)>/g,
    (match, before, src, after) => {
      let result = match;
      if (!result.includes('loading=')) {
        result = result.replace('>', ' loading="eager">');
      } else {
        result = result.replace(/loading="lazy"/, 'loading="eager"');
      }
      if (!result.includes('fetchpriority=')) {
        result = result.replace('>', ' fetchpriority="high">');
      }
      return result;
    }
  );

  // 5. Substituir Tailwind CDN bloqueante por versão com defer
  // <script src="https://cdn.tailwindcss.com/..."> → adicionar defer
  content = content.replace(
    /<script src="(https:\/\/cdn\.tailwindcss\.com\/[^"]+)"><\/script>/g,
    (match, src) => {
      // Não pode usar defer em scripts que definem variáveis usadas sincronamente,
      // mas o config tailwind vem logo depois, então usamos onload trick:
      // Mantemos o script mas adicionamos a tag de preload
      return match; // Mantemos por ora, tratamos o CSS fonts abaixo
    }
  );

  // 6. Otimizar Google Fonts: usar display=swap e preload crítico
  // Unificar as duas chamadas de font (Jakarta + Geist) em uma só
  content = content.replace(
    /(<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^"]*" rel="stylesheet"\/>)\s*(<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Geist[^"]*" rel="stylesheet"\/>)/g,
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const changes = (content.split('').filter((c, i) => c !== original[i]).length);
    console.log(`✓ ${file} — atualizado`);
    totalChanges++;
  } else {
    console.log(`  ${file} — sem alterações`);
  }
}

console.log(`\n✓ ${totalChanges} arquivo(s) atualizado(s).`);
