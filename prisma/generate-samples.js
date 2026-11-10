const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function createMinimalPdf(title, subject, grade, category) {
  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 260 >>
stream
BT
/F1 24 Tf
50 720 Td
(PadhoOrion Educational Resource) Tj
/F1 16 Tf
0 -40 Td
(${title}) Tj
/F1 14 Tf
0 -30 Td
(Grade: ${grade} | Subject: ${subject} | Category: ${category}) Tj
/F1 12 Tf
0 -30 Td
(Shared on PadhoOrion - School Notes & Homework Community) Tj
0 -25 Td
(Authentic verified student contribution for peer learning.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
630
%%EOF
`.trim();
  return Buffer.from(content);
}

// Generate sample PDFs
const samples = [
  { name: 'sample-algebra-notes.pdf', title: 'Algebra Equations & Polynomials', subject: 'Mathematics', grade: '9th Grade', category: 'Handwritten Notes' },
  { name: 'sample-physics-worksheet.pdf', title: 'Force and Laws of Motion Worksheet', subject: 'Science', grade: '9th Grade', category: 'Worksheet' },
  { name: 'sample-cell-biology.pdf', title: 'Cell Structure and Functions', subject: 'Science', grade: '8th Grade', category: 'Notebook' },
  { name: 'sample-history-notes.pdf', title: 'The French Revolution Summary', subject: 'Social Studies', grade: '9th Grade', category: 'AI Notes' },
  { name: 'sample-geometry-qa.pdf', title: 'Triangles & Congruence Solved Q&A', subject: 'Mathematics', grade: '7th Grade', category: 'Q&A' },
  { name: 'sample-english-grammar.pdf', title: 'Tenses and Active-Passive Voice', subject: 'English', grade: '7th Grade', category: 'Notebook' },
  { name: 'sample-photosynthesis.pdf', title: 'Plant Physiology & Photosynthesis', subject: 'Science', grade: '7th Grade', category: 'Handwritten Notes' },
  { name: 'sample-computer-science.pdf', title: 'Introduction to Python & Flowcharts', subject: 'Computer Science', grade: '10th Grade', category: 'AI Notes' },
];

for (const sample of samples) {
  const filePath = path.join(uploadsDir, sample.name);
  fs.writeFileSync(filePath, createMinimalPdf(sample.title, sample.subject, sample.grade, sample.category));
}

// Generate sample SVG/PNG image preview
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#f5f1e6" />
  <rect x="40" y="40" width="720" height="920" rx="8" fill="#fffcf5" stroke="#dbd0ba" stroke-width="2" />
  <!-- vintage lined paper effect -->
  <line x1="80" y1="120" x2="720" y2="120" stroke="#dbd0ba" stroke-width="1.5" />
  <line x1="80" y1="170" x2="720" y2="170" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="220" x2="720" y2="220" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="270" x2="720" y2="270" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="320" x2="720" y2="320" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="370" x2="720" y2="370" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="420" x2="720" y2="420" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="470" x2="720" y2="470" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="520" x2="720" y2="520" stroke="#dbd0ba" stroke-width="1" />
  <line x1="80" y1="570" x2="720" y2="570" stroke="#dbd0ba" stroke-width="1" />
  
  <!-- Content -->
  <text x="80" y="95" font-family="Georgia, serif" font-size="28" fill="#4a3f35" font-weight="bold">PadhoOrion Handwritten Notes</text>
  <text x="80" y="155" font-family="system-ui, sans-serif" font-size="18" fill="#a67c52" font-weight="bold">Chapter: Linear Equations & Coordinate Geometry</text>
  <text x="80" y="205" font-family="Georgia, serif" font-size="16" fill="#4a3f35">1. Standard form of a linear equation in two variables: ax + by + c = 0</text>
  <text x="80" y="255" font-family="Georgia, serif" font-size="16" fill="#4a3f35">2. A linear equation has infinitely many solutions (ordered pairs).</text>
  <text x="80" y="305" font-family="Georgia, serif" font-size="16" fill="#4a3f35">3. The graph of every linear equation in two variables is a straight line.</text>
  <text x="80" y="355" font-family="Georgia, serif" font-size="16" fill="#4a3f35">4. Distance Formula: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)</text>
  <text x="80" y="405" font-family="Georgia, serif" font-size="16" fill="#4a3f35">5. Section Formula: ((m1*x2 + m2*x1)/(m1+m2), (m1*y2 + m2*y1)/(m1+m2))</text>
  
  <rect x="80" y="650" width="640" height="180" rx="6" fill="#ece5d8" stroke="#dbd0ba" />
  <text x="110" y="700" font-family="system-ui, sans-serif" font-size="16" fill="#4a3f35" font-weight="bold">Important Teacher Remarks:</text>
  <text x="110" y="740" font-family="Georgia, serif" font-size="15" fill="#7d6b56">Always label x-axis and y-axis with proper scaling in exam graph sheets.</text>
  <text x="110" y="775" font-family="Georgia, serif" font-size="15" fill="#7d6b56">Double check negative signs when substituting into the distance formula.</text>
  
  <text x="80" y="910" font-family="system-ui, sans-serif" font-size="13" fill="#7d6b56">Uploaded to PadhoOrion by Adhrit [7th Grade] - Community Verified</text>
</svg>`;

fs.writeFileSync(path.join(uploadsDir, 'sample-handwritten-preview.svg'), sampleSvg);
console.log('Sample documents successfully generated in public/uploads');

