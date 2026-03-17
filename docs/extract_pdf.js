const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'd:\\project sem-6\\project sem-6\\hall-booking-system\\docs\\BCA_Project Part_4_All_chapters.pdf';
const outPath = 'd:\\project sem-6\\project sem-6\\hall-booking-system\\docs\\pdf_content.txt';

async function main() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    fs.writeFileSync(outPath, data.text, 'utf8');
    console.log('Pages:', data.numpages);
    console.log('Length:', data.text.length);
    console.log('Written to', outPath);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
