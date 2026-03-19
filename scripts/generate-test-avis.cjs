#!/usr/bin/env node
/**
 * RÉCUPÉO — Générateur de PDF de test MONIMPOT V2
 * Génère 8 avis d'imposition synthétiques pour tester l'extraction OCR/Vision
 * Usage: node scripts/generate-test-avis.js [--output /chemin/sortie]
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// --- Argument output dir ---
const args = process.argv.slice(2);
const outputIdx = args.indexOf('--output');
const OUTPUT_DIR = outputIdx !== -1 ? args[outputIdx + 1] : '/tmp/test-avis';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- Helpers ---
function fmtMontant(n) {
  if (n == null) return '';
  const abs = Math.abs(n);
  const s = abs.toString();
  const parts = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.substring(Math.max(0, i - 3), i));
  }
  const formatted = parts.join(' ');
  return n < 0 ? '- ' + formatted + ' \u20AC' : formatted + ' \u20AC';
}

function fmtMontantCompact(n) {
  if (n == null) return '';
  const abs = Math.abs(n);
  const s = abs.toString();
  const parts = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.substring(Math.max(0, i - 3), i));
  }
  return parts.join(' ') + ' \u20AC';
}

// --- 8 profils de test ---
const TEST_PROFILES = [
  {
    id: 'T-01',
    filename: 'avis-celibataire-simple.pdf',
    annee: 2024,
    nom: 'MARTIN Jean',
    numeroFiscal: '12 34 567 890 123',
    numeroAvis: '2025 123 456 789',
    adresse: '15 rue des Lilas, 69003 Lyon',
    adresseCentre: 'SIP de Lyon 3ème\n45 rue de la Part-Dieu\n69003 Lyon',
    situation: 'Célibataire',
    sitCode: 'C',
    parts: 1,
    personnesCharge: 0,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 28000 },
    ],
    revenuBrutGlobal: 28000,
    chargesDeductibles: 0,
    revenuNetImposable: 25200,
    rfr: 25200,
    impotBrut: 1550,
    decote: 350,
    reductions: 0,
    impotNet: 1200,
    prelevementSource: 1100,
    solde: 100,
    cases: [],
    description: 'Célibataire simple, pas de déductions — maximum de pistes d\'optimisation',
  },
  {
    id: 'T-02',
    filename: 'avis-couple-2-salaires.pdf',
    annee: 2024,
    nom: 'DUPONT Pierre et Marie',
    numeroFiscal: '23 45 678 901 234',
    numeroAvis: '2025 234 567 890',
    adresse: '8 avenue Victor Hugo, 75016 Paris',
    adresseCentre: 'SIP de Paris 16ème\n12 avenue Kléber\n75016 Paris',
    situation: 'Marié(e)',
    sitCode: 'M',
    parts: 2,
    personnesCharge: 0,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 35000 },
      { code: '1BJ', label: 'Traitements et salaires — Déclarant 2', montant: 28000 },
    ],
    revenuBrutGlobal: 63000,
    chargesDeductibles: 0,
    revenuNetImposable: 56700,
    rfr: 56700,
    impotBrut: 5100,
    decote: 0,
    reductions: 0,
    impotNet: 4500,
    prelevementSource: 4200,
    solde: 300,
    cases: [],
    description: 'Couple 2 déclarants — teste extraction 1AJ + 1BJ séparés (O4)',
  },
  {
    id: 'T-03',
    filename: 'avis-parent-isole.pdf',
    annee: 2024,
    nom: 'LEROY Sophie',
    numeroFiscal: '34 56 789 012 345',
    numeroAvis: '2025 345 678 901',
    adresse: '22 rue de la République, 42000 Saint-Étienne',
    adresseCentre: 'SIP de Saint-Étienne Centre\n3 cours Fauriel\n42100 Saint-Étienne',
    situation: 'Divorcé(e)',
    sitCode: 'D',
    parts: 2.5,
    personnesCharge: 2,
    caseT: true,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 24000 },
    ],
    revenuBrutGlobal: 24000,
    chargesDeductibles: 0,
    revenuNetImposable: 21600,
    rfr: 21600,
    impotBrut: 0,
    decote: 0,
    reductions: 0,
    impotNet: 0,
    prelevementSource: 0,
    solde: 0,
    cases: [
      { code: 'T', label: 'Parent isolé', montant: null },
    ],
    description: 'Parent isolé non imposable — teste impôt=0 et case T cochée',
  },
  {
    id: 'T-04',
    filename: 'avis-retraite-senior.pdf',
    annee: 2024,
    nom: 'BERNARD Robert',
    numeroFiscal: '45 67 890 123 456',
    numeroAvis: '2025 456 789 012',
    adresse: '5 place Bellecour, 69002 Lyon',
    adresseCentre: 'SIP de Lyon 2ème\n18 rue Sala\n69002 Lyon',
    situation: 'Veuf(ve)',
    sitCode: 'V',
    parts: 1,
    personnesCharge: 0,
    revenus: [
      { code: '1AS', label: 'Pensions, retraites, rentes — Déclarant 1', montant: 22000 },
    ],
    revenuBrutGlobal: 22000,
    chargesDeductibles: 0,
    revenuNetImposable: 19800,
    rfr: 19800,
    impotBrut: 1100,
    decote: 300,
    reductions: 0,
    impotNet: 800,
    prelevementSource: 750,
    solde: 50,
    cases: [
      { code: '7UF', label: 'Dons aux organismes d\'intérêt général', montant: 500 },
    ],
    description: 'Retraité veuf avec dons déclarés — teste pensions et cases renseignées',
  },
  {
    id: 'T-05',
    filename: 'avis-foncier-micro.pdf',
    annee: 2024,
    nom: 'MOREAU Alain et Catherine',
    numeroFiscal: '56 78 901 234 567',
    numeroAvis: '2025 567 890 123',
    adresse: '30 boulevard Gambetta, 34000 Montpellier',
    adresseCentre: 'SIP de Montpellier Centre\n22 place de la Comédie\n34000 Montpellier',
    situation: 'Marié(e)',
    sitCode: 'M',
    parts: 2.5,
    personnesCharge: 1,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 40000 },
      { code: '4BE', label: 'Revenus fonciers — Régime micro-foncier', montant: 12000 },
    ],
    revenuBrutGlobal: 48400,
    chargesDeductibles: 0,
    revenuNetImposable: 44400,
    rfr: 44400,
    impotBrut: 3800,
    decote: 0,
    reductions: 0,
    impotNet: 3200,
    prelevementSource: 3000,
    solde: 200,
    cases: [],
    description: 'Couple avec micro-foncier (4BE) — teste extraction revenus fonciers (O4)',
  },
  {
    id: 'T-06',
    filename: 'avis-revenus-capitaux.pdf',
    annee: 2024,
    nom: 'PETIT Isabelle',
    numeroFiscal: '67 89 012 345 678',
    numeroAvis: '2025 678 901 234',
    adresse: '12 rue du Commerce, 75015 Paris',
    adresseCentre: 'SIP de Paris 15ème\n95 rue de Vaugirard\n75015 Paris',
    situation: 'Célibataire',
    sitCode: 'C',
    parts: 1,
    personnesCharge: 0,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 30000 },
      { code: '2DC', label: 'Revenus de capitaux mobiliers', montant: 8000 },
    ],
    revenuBrutGlobal: 30000,
    chargesDeductibles: 0,
    revenuNetImposable: 27000,
    rfr: 35000,
    impotBrut: 2400,
    decote: 0,
    reductions: 0,
    impotNet: 2100,
    prelevementSource: 2000,
    solde: 100,
    pfuMontant: 2400,
    cases: [],
    note2OP: 'Case 2OP NON cochée — Prélèvement Forfaitaire Unique (PFU) appliqué',
    description: 'Célibataire avec capitaux + PFU — teste détection case 2OP (O5)',
  },
  {
    id: 'T-07',
    filename: 'avis-complexe-tout.pdf',
    annee: 2024,
    nom: 'GARCIA Thomas et Laura',
    numeroFiscal: '78 90 123 456 789',
    numeroAvis: '2025 789 012 345',
    adresse: '7 rue Garibaldi, 69006 Lyon',
    adresseCentre: 'SIP de Lyon 6ème\n51 cours Vitton\n69006 Lyon',
    situation: 'Marié(e)',
    sitCode: 'M',
    parts: 3,
    personnesCharge: 2,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 42000 },
      { code: '1BJ', label: 'Traitements et salaires — Déclarant 2', montant: 35000 },
      { code: '2DC', label: 'Revenus de capitaux mobiliers', montant: 3000 },
      { code: '4BA', label: 'Revenus fonciers nets', montant: 8500 },
    ],
    revenuBrutGlobal: 85300,
    chargesDeductibles: 4000,
    revenuNetImposable: 76950,
    rfr: 79950,
    impotBrut: 7200,
    decote: 0,
    reductions: 1400,
    impotNet: 5800,
    prelevementSource: 5500,
    solde: 300,
    cases: [
      { code: '1AK', label: 'Frais réels — Déclarant 1', montant: 6200 },
      { code: '7GA', label: 'Frais de garde enfant — 1er enfant', montant: 2300 },
      { code: '6NS', label: 'Épargne retraite PER — Déclarant 1', montant: 4000 },
    ],
    description: 'Avis complexe multi-cases — teste extraction massive de cases',
  },
  {
    id: 'T-08',
    filename: 'avis-grosse-restitution.pdf',
    annee: 2024,
    nom: 'ROUX Nathalie',
    numeroFiscal: '89 01 234 567 890',
    numeroAvis: '2025 890 123 456',
    adresse: '3 quai Saint-Antoine, 69002 Lyon',
    adresseCentre: 'SIP de Lyon 2ème\n18 rue Sala\n69002 Lyon',
    situation: 'Célibataire',
    sitCode: 'C',
    parts: 1,
    personnesCharge: 0,
    revenus: [
      { code: '1AJ', label: 'Traitements et salaires — Déclarant 1', montant: 45000 },
    ],
    revenuBrutGlobal: 45000,
    chargesDeductibles: 0,
    revenuNetImposable: 40500,
    rfr: 40500,
    impotBrut: 5200,
    decote: 0,
    reductions: 1700,
    impotNet: 3500,
    prelevementSource: 6200,
    solde: -2700,
    cases: [
      { code: '7DB', label: 'Emploi salarié à domicile — sommes versées', montant: 6800 },
    ],
    description: 'Grosse restitution (-2 700€) — CRITIQUE : teste distinction impôt net vs solde',
  },
];

// --- Générateur PDF ---
function generateAvisPDF(profile) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    info: {
      Title: `Avis d'impôt sur le revenu ${profile.annee + 1} — ${profile.id}`,
      Author: 'RÉCUPÉO — Générateur de test',
    },
  });

  const filePath = path.join(OUTPUT_DIR, profile.filename);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const LEFT = doc.page.margins.left;
  let y = doc.page.margins.top;

  // === Couleurs ===
  const NAVY = '#0B1426';
  const DARK_BLUE = '#1a3a5c';
  const MEDIUM_BLUE = '#2c5f8a';
  const LIGHT_BG = '#f0f4f8';
  const WHITE = '#ffffff';
  const RED = '#c0392b';
  const GREEN = '#27ae60';

  // === EN-TÊTE : bandeau DGFiP ===
  doc.rect(LEFT - 10, y - 10, W + 20, 85).fill(DARK_BLUE);
  doc.fill(WHITE).fontSize(8).font('Helvetica');
  doc.text('RÉPUBLIQUE FRANÇAISE', LEFT, y, { width: W, align: 'center' });
  y += 12;
  doc.fontSize(7).text('Liberté — Égalité — Fraternité', LEFT, y, { width: W, align: 'center' });
  y += 16;
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text('DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES', LEFT, y, { width: W, align: 'center' });
  y += 18;
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`AVIS D'IMPÔT SUR LE REVENU ${profile.annee + 1}`, LEFT, y, { width: W, align: 'center' });
  y += 14;
  doc.fontSize(9).font('Helvetica');
  doc.text(`(Revenus de l'année ${profile.annee})`, LEFT, y, { width: W, align: 'center' });
  y += 30;

  // === IDENTIFICATION ===
  doc.fill(NAVY);
  doc.rect(LEFT - 5, y - 5, W + 10, 55).fill(LIGHT_BG);
  doc.fill(NAVY).fontSize(8).font('Helvetica');
  doc.text(`N° fiscal :  ${profile.numeroFiscal}`, LEFT + 5, y + 2);
  doc.text(`N° d'avis :  ${profile.numeroAvis}`, LEFT + W / 2, y + 2);
  y += 16;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text(profile.nom, LEFT + 5, y);
  y += 14;
  doc.font('Helvetica').fontSize(8);
  doc.text(profile.adresse, LEFT + 5, y);
  y += 30;

  // === VOTRE CENTRE DES FINANCES PUBLIQUES ===
  doc.font('Helvetica-Bold').fontSize(9).fill(DARK_BLUE);
  doc.text('VOS CONTACTS', LEFT, y);
  y += 14;
  doc.font('Helvetica').fontSize(8).fill(NAVY);
  const centreLines = profile.adresseCentre.split('\n');
  for (const line of centreLines) {
    doc.text(line, LEFT + 10, y);
    y += 11;
  }
  doc.text('Tél : 0 809 401 401 (service gratuit + prix appel)', LEFT + 10, y);
  y += 20;

  // === SITUATION DU FOYER FISCAL ===
  doc.rect(LEFT - 5, y - 5, W + 10, 0.5).fill(MEDIUM_BLUE);
  y += 5;
  doc.font('Helvetica-Bold').fontSize(10).fill(DARK_BLUE);
  doc.text('SITUATION DU FOYER FISCAL', LEFT, y);
  y += 18;
  doc.font('Helvetica').fontSize(9).fill(NAVY);

  const sitItems = [
    ['Situation de famille', profile.situation],
    ['Nombre de parts', profile.parts.toString()],
    ['Nombre de personnes à charge', profile.personnesCharge.toString()],
  ];
  if (profile.caseT) {
    sitItems.push(['Case T (parent isolé)', 'COCHÉE']);
  }
  for (const [label, val] of sitItems) {
    doc.font('Helvetica').text(label, LEFT + 10, y, { continued: true, width: 250 });
    doc.font('Helvetica-Bold').text(`  ${val}`, { width: 200 });
    y += 15;
  }
  y += 10;

  // === VOS REVENUS ===
  doc.rect(LEFT - 5, y - 5, W + 10, 0.5).fill(MEDIUM_BLUE);
  y += 5;
  doc.font('Helvetica-Bold').fontSize(10).fill(DARK_BLUE);
  doc.text('VOS REVENUS', LEFT, y);
  y += 18;
  doc.font('Helvetica').fontSize(9).fill(NAVY);

  for (const rev of profile.revenus) {
    doc.font('Helvetica').text(`${rev.label} (${rev.code})`, LEFT + 10, y, { width: 350 });
    doc.font('Helvetica-Bold').text(fmtMontant(rev.montant), LEFT + 370, y, { width: 120, align: 'right' });
    y += 15;
  }

  y += 5;
  doc.rect(LEFT + 10, y, W - 20, 0.3).fill('#cccccc');
  y += 8;

  const revItems = [
    ['Revenu brut global', profile.revenuBrutGlobal],
  ];
  if (profile.chargesDeductibles) {
    revItems.push(['Charges déductibles', -profile.chargesDeductibles]);
  }
  revItems.push(
    ['Revenu net imposable', profile.revenuNetImposable],
    ['REVENU FISCAL DE RÉFÉRENCE', profile.rfr],
  );

  for (const [label, val] of revItems) {
    const isBold = label.includes('RÉFÉRENCE') || label.includes('net imposable');
    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(isBold ? 9.5 : 9);
    doc.text(label, LEFT + 10, y, { width: 350 });
    doc.font('Helvetica-Bold').text(fmtMontant(val), LEFT + 370, y, { width: 120, align: 'right' });
    y += 15;
  }
  y += 10;

  // === NOTE PFU / 2OP si applicable ===
  if (profile.note2OP) {
    doc.rect(LEFT + 10, y - 3, W - 20, 20).fill('#fff8e1');
    doc.fill('#8d6e00').fontSize(7.5).font('Helvetica');
    doc.text(`⚠ ${profile.note2OP}`, LEFT + 15, y);
    if (profile.pfuMontant) {
      doc.text(`   PFU sur revenus mobiliers : ${fmtMontant(profile.pfuMontant)}`, LEFT + 15, y + 10);
    }
    y += 28;
    doc.fill(NAVY);
  }

  // === VOTRE IMPÔT SUR LE REVENU ===
  doc.rect(LEFT - 5, y - 5, W + 10, 0.5).fill(MEDIUM_BLUE);
  y += 5;
  doc.font('Helvetica-Bold').fontSize(10).fill(DARK_BLUE);
  doc.text('VOTRE IMPÔT SUR LE REVENU', LEFT, y);
  y += 18;
  doc.font('Helvetica').fontSize(9).fill(NAVY);

  const impotItems = [
    ['Impôt sur le revenu brut', profile.impotBrut],
  ];
  if (profile.decote) {
    impotItems.push(['Décote', -profile.decote]);
  }
  if (profile.reductions) {
    impotItems.push(['Réductions d\'impôt', -profile.reductions]);
  }
  impotItems.push(['IMPÔT NET', profile.impotNet]);

  for (const [label, val] of impotItems) {
    const isNet = label === 'IMPÔT NET';
    doc.font(isNet ? 'Helvetica-Bold' : 'Helvetica').fontSize(isNet ? 10 : 9);
    doc.text(label, LEFT + 10, y, { width: 350 });
    doc.font('Helvetica-Bold').text(fmtMontant(val), LEFT + 370, y, { width: 120, align: 'right' });
    y += isNet ? 18 : 15;
  }

  y += 5;
  doc.rect(LEFT + 10, y, W - 20, 0.3).fill('#cccccc');
  y += 10;

  // Prélèvement à la source + solde
  doc.font('Helvetica').fontSize(9);
  doc.text('Prélèvement à la source déjà versé', LEFT + 10, y, { width: 350 });
  doc.font('Helvetica-Bold').text(fmtMontant(profile.prelevementSource), LEFT + 370, y, { width: 120, align: 'right' });
  y += 18;

  // === RÉSULTAT (SOLDE) — gros encadré ===
  const soldeLabel = profile.solde < 0
    ? 'MONTANT DE VOTRE RESTITUTION'
    : profile.solde === 0
      ? 'AUCUN MONTANT RESTANT À PAYER'
      : 'MONTANT RESTANT À PAYER';
  const soldeColor = profile.solde < 0 ? GREEN : profile.solde === 0 ? GREEN : RED;

  doc.rect(LEFT, y - 3, W, 35).fill(soldeColor);
  doc.fill(WHITE).font('Helvetica-Bold').fontSize(11);
  doc.text(soldeLabel, LEFT + 15, y + 2, { width: W - 150 });
  doc.fontSize(14);
  const soldeText = profile.solde < 0
    ? `+ ${fmtMontantCompact(profile.solde)}`
    : profile.solde === 0
      ? '0 €'
      : fmtMontantCompact(profile.solde);
  doc.text(soldeText, LEFT + W - 160, y + 2, { width: 145, align: 'right' });
  y += 45;
  doc.fill(NAVY);

  // === CASES RENSEIGNÉES / CHARGES ===
  if (profile.cases && profile.cases.length > 0) {
    doc.rect(LEFT - 5, y - 5, W + 10, 0.5).fill(MEDIUM_BLUE);
    y += 5;
    doc.font('Helvetica-Bold').fontSize(10).fill(DARK_BLUE);
    doc.text('CHARGES ET RÉDUCTIONS DÉCLARÉES', LEFT, y);
    y += 18;
    doc.fill(NAVY).fontSize(9);

    for (const c of profile.cases) {
      doc.font('Helvetica').text(`${c.label} (${c.code})`, LEFT + 10, y, { width: 350 });
      if (c.montant != null) {
        doc.font('Helvetica-Bold').text(fmtMontant(c.montant), LEFT + 370, y, { width: 120, align: 'right' });
      } else {
        doc.font('Helvetica-Bold').text('Oui', LEFT + 370, y, { width: 120, align: 'right' });
      }
      y += 15;
    }
    y += 10;
  }

  // === MENTIONS LÉGALES ===
  y += 10;
  doc.rect(LEFT - 5, y, W + 10, 0.3).fill('#cccccc');
  y += 10;
  doc.fontSize(6.5).font('Helvetica').fill('#888888');
  doc.text(
    `Cet avis est un document de TEST généré par RÉCUPÉO pour valider le système d'extraction. ` +
    `Les montants et identifiants sont fictifs. Ne pas utiliser comme justificatif.`,
    LEFT, y, { width: W, align: 'center' }
  );
  y += 12;
  doc.text(
    `ID profil : ${profile.id} — ${profile.description}`,
    LEFT, y, { width: W, align: 'center' }
  );

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// === MAIN ===
async function main() {
  console.log(`\n🧾 RÉCUPÉO — Générateur d'avis d'imposition de test`);
  console.log(`   Sortie : ${OUTPUT_DIR}\n`);

  let ok = 0;
  let ko = 0;

  for (const profile of TEST_PROFILES) {
    try {
      const filePath = await generateAvisPDF(profile);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  ✅ ${profile.id} — ${profile.filename} (${sizeKB} Ko)`);
      console.log(`     ${profile.description}`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${profile.id} — ${profile.filename} : ${err.message}`);
      ko++;
    }
  }

  console.log(`\n📊 Résultat : ${ok} OK / ${ko} KO`);
  console.log(`📁 Fichiers dans : ${OUTPUT_DIR}\n`);

  if (ko > 0) process.exit(1);
}

main().catch(err => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
