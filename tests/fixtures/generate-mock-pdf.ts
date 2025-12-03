/**
 * ============================================
 * SIGEA - Gerador de PDF de Prova Mockada
 * ============================================
 * Gera um PDF de prova de exemplo para testes
 * de upload no sistema
 * 
 * Execute com: npx ts-node tests/fixtures/generate-mock-pdf.ts
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Questões mockadas de Matemática
const questoesMatematica = [
  {
    numero: 1,
    enunciado: 'Resolva a seguinte equação de primeiro grau: 3x + 7 = 22',
    tipo: 'Aberta',
    valor: 2.0,
  },
  {
    numero: 2,
    enunciado: 'Calcule o valor de: 125 ÷ 5 + 18 × 2 - 10',
    tipo: 'Aberta',
    valor: 2.0,
  },
  {
    numero: 3,
    enunciado: 'Qual é o resultado de (-8) + (+15) - (-3)?',
    alternativas: ['A) 6', 'B) 10', 'C) 20', 'D) -10'],
    resposta: 'B',
    tipo: 'Múltipla Escolha',
    valor: 1.5,
  },
  {
    numero: 4,
    enunciado: 'Uma escola tem 450 alunos. Se 2/5 desses alunos participam do projeto de leitura, quantos alunos participam?',
    tipo: 'Aberta',
    valor: 2.0,
  },
  {
    numero: 5,
    enunciado: 'O triângulo ABC tem lados medindo 5cm, 12cm e 13cm. Este triângulo é:',
    alternativas: [
      'A) Equilátero',
      'B) Isósceles',
      'C) Escaleno e retângulo',
      'D) Escaleno e obtusângulo',
    ],
    resposta: 'C',
    tipo: 'Múltipla Escolha',
    valor: 1.5,
  },
  {
    numero: 6,
    enunciado: 'Simplifique a expressão: 2(x + 3) - 4(x - 1) + 5x',
    tipo: 'Aberta',
    valor: 1.0,
  },
];

function generateMockPDF(): void {
  const outputPath = path.join(__dirname, 'prova-matematica-mock.pdf');
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // Cabeçalho da prova
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('SIGEA - Sistema de Gestão Escolar Acadêmica', { align: 'center' });

  doc.moveDown(0.5);

  doc
    .fontSize(14)
    .text('AVALIAÇÃO DE MATEMÁTICA - 1º BIMESTRE', { align: 'center' });

  doc.moveDown(1);

  // Informações da prova
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Escola: Centro Educacional Maria Montessori', { continued: true })
    .text('', { align: 'right' });

  doc.text('Turma: 6º Ano A - Turno Matutino');
  doc.text('Professor(a): João da Silva');
  doc.text('Data: ___/___/2025');
  doc.text('Valor: 10,0 pontos');

  doc.moveDown(1);

  // Dados do aluno
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DADOS DO ALUNO:');

  doc
    .font('Helvetica')
    .text('Nome: _____________________________________________');
  doc.text('Nº: ______ Turma: ______');

  doc.moveDown(1);

  // Linha separadora
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();

  doc.moveDown(1);

  // Instruções
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('INSTRUÇÕES:');

  doc
    .font('Helvetica')
    .fontSize(9)
    .text('• Leia atentamente cada questão antes de responder.')
    .text('• As questões de múltipla escolha têm apenas UMA alternativa correta.')
    .text('• Mostre todos os cálculos nas questões abertas.')
    .text('• Não é permitido o uso de calculadora.')
    .text('• A prova deve ser feita a caneta azul ou preta.');

  doc.moveDown(1.5);

  // Questões
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('QUESTÕES', { align: 'center' });

  doc.moveDown(1);

  questoesMatematica.forEach((questao) => {
    // Número e valor da questão
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Questão ${questao.numero} (${questao.valor} ponto${questao.valor !== 1 ? 's' : ''})`, {
        continued: false,
      });

    doc.moveDown(0.3);

    // Enunciado
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(questao.enunciado);

    doc.moveDown(0.5);

    // Alternativas (se houver)
    if (questao.alternativas) {
      questao.alternativas.forEach((alt) => {
        doc.text(`   ${alt}`);
      });
    } else {
      // Espaço para resposta
      doc.text('Resposta: ________________________________________________');
      doc.moveDown(0.3);
      doc.text('Cálculos:');
      doc.moveDown(2);
    }

    doc.moveDown(1);
  });

  // Rodapé
  doc.moveDown(2);
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text('Documento gerado automaticamente pelo SIGEA para fins de teste.', {
      align: 'center',
    });

  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ PDF gerado com sucesso em: ${outputPath}`);
    console.log(`📄 Arquivo de ${fs.statSync(outputPath).size} bytes`);
  });
}

// Executa
generateMockPDF();
