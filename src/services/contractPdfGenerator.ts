import jsPDF from 'jspdf';
import { LegalCase, LawyerProfile } from '../types';

/**
 * Service to generate and export professional legal contracts in PDF
 * "Contrato de Prestação de Serviços Advocatícios e Honorários"
 */
export const ContractPdfGenerator = {
  generateContract(caseItem: LegalCase, profile: LawyerProfile): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        drawPageBorderAndHeader();
      }
    };

    const drawPageBorderAndHeader = () => {
      // Subtle elegant header line
      doc.setDrawColor(197, 160, 89); // Gold #C5A059
      doc.setLineWidth(0.8);
      doc.line(margin, 12, pageWidth - margin, 12);

      // Header top small text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const headerTitle = profile.name ? `DR(A). ${profile.name.toUpperCase()}` : 'ADVOCACIA & CONSULTORIA JURÍDICA';
      const oabText = profile.oabNumber ? ` | OAB/${profile.oabState || 'UF'} Nº ${profile.oabNumber}` : '';
      doc.text(`${headerTitle}${oabText}`, margin, 9);
      doc.text('CONTRATO DE HONORÁRIOS ADVOCATÍCIOS', pageWidth - margin, 9, { align: 'right' });

      // Footer line & page number
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(`Documento emitido via Tec Justiça Lite em ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 8);
      const pageNum = doc.getNumberOfPages();
      doc.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    };

    // Draw header for page 1
    drawPageBorderAndHeader();
    y = 20;

    // Document Title
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(160, 120, 40); // Gold tone
    doc.text('E FIXAÇÃO DE HONORÁRIOS PROFISSIONAIS', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Introduction paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);

    const lawyerName = profile.name ? profile.name.trim() : 'Advogado(a) Contratado(a)';
    const lawyerOab = profile.oabNumber ? `inscrito(a) na OAB/${profile.oabState || 'UF'} sob o nº ${profile.oabNumber}` : 'regularmente inscrito(a) na Ordem dos Advogados do Brasil';
    const lawyerSpecialty = profile.specialty || 'Direito Geral';
    const lawyerEmail = profile.email ? `, e-mail: ${profile.email}` : '';
    const lawyerPhone = profile.phone ? `, tel/WhatsApp: ${profile.phone}` : '';

    const clientName = caseItem.clientName || 'Cliente Contratante';
    const clientType = caseItem.clientType || 'Pessoa Física';
    const clientDoc = caseItem.clientDocument ? `, inscrito(a) no ${clientType === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'} sob nº ${caseItem.clientDocument}` : '';
    const clientPhone = caseItem.clientPhone ? `, telefone/WhatsApp: ${caseItem.clientPhone}` : '';
    const clientEmail = caseItem.clientEmail ? `, e-mail: ${caseItem.clientEmail}` : '';

    // Parties Box
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, y, contentWidth, 36, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('1. CONTRATANTE:', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const clientText = `${clientName.toUpperCase()}${clientDoc}${clientPhone}${clientEmail}.`;
    const splitClient = doc.splitTextToSize(clientText, contentWidth - 6);
    doc.text(splitClient, margin + 3, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('2. CONTRATADO(A):', margin + 3, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lawyerText = `DR(A). ${lawyerName.toUpperCase()}, advogado(a), ${lawyerOab}, atuante em ${lawyerSpecialty}${lawyerEmail}${lawyerPhone}.`;
    const splitLawyer = doc.splitTextToSize(lawyerText, contentWidth - 6);
    doc.text(splitLawyer, margin + 3, y + 26);

    y += 42;

    const addClause = (title: string, paragraphs: string[]) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(150, 110, 30);
      doc.text(title, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);

      paragraphs.forEach((p) => {
        const lines = doc.splitTextToSize(p, contentWidth);
        checkPageBreak(lines.length * 4.2 + 3);
        doc.text(lines, margin, y);
        y += lines.length * 4.2 + 2;
      });
      y += 2;
    };

    // CLÁUSULA PRIMEIRA - DO OBJETO
    const caseTitle = caseItem.title || 'Patrocínio de interesses jurídicos';
    const caseProcess = caseItem.processNumber ? ` (Processo nº ${caseItem.processNumber})` : '';
    const caseVara = caseItem.courtOrVara ? `, perante ${caseItem.courtOrVara}` : '';
    const caseOpponent = caseItem.opponentName ? ` em face de ${caseItem.opponentName}` : '';
    const caseSpecialty = caseItem.specialty ? ` no âmbito do ${caseItem.specialty}` : '';

    addClause('CLÁUSULA PRIMEIRA – DO OBJETO DA PRESTAÇÃO DE SERVIÇOS', [
      `1.1. O presente instrumento tem como objeto a prestação de serviços advocatícios profissionais pelo(a) CONTRATADO(A) em favor do(a) CONTRATANTE, para atuação, assessoria e defesa de seus direitos relativos à causa: "${caseTitle}"${caseSpecialty}${caseProcess}${caseOpponent}${caseVara}.`,
      `1.2. A atuação contratada compreende o ajuizamento, acompanhamento, redação de peças, participação em audiências e interposição de medidas e recursos cabíveis na instância competente para o fiel cumprimento do mandato judicial/extrajudicial outorgado.`,
      `1.3. O(A) CONTRATADO(A) assume a obrigação de meio, empregando todo o zelo, dedicação e técnica jurídica no patrocínio da causa, não garantindo resultado específico em razão da natureza da atividade judicial.`,
    ]);

    // CLÁUSULA SEGUNDA - DOS HONORÁRIOS E FORMA DE PAGAMENTO
    const budget = caseItem.budgetAmount ? caseItem.budgetAmount.trim() : 'A combinar';
    const method = caseItem.paymentMethod || 'À Vista / PIX';
    const downPay = caseItem.downPayment ? ` com entrada de ${caseItem.downPayment.trim()}` : '';
    const installments = caseItem.installmentsCount ? ` parcelado em ${caseItem.installmentsCount} parcelas${caseItem.installmentValue ? ` de ${caseItem.installmentValue.trim()}` : ''}` : '';
    const payDetails = caseItem.paymentDetails ? ` Detalhes complementares: ${caseItem.paymentDetails.trim()}.` : '';

    let paymentClauseText = `2.1. Pelos serviços advocatícios contratados, o(a) CONTRATANTE pagará ao(à) CONTRATADO(A) os honorários no valor total de ${budget}, mediante a modalidade: ${method}${downPay}${installments}.${payDetails}`;

    if (method.includes('Êxito') || method.includes('Percentual')) {
      paymentClauseText += ' Na hipótese de honorários de êxito, o percentual pactuado incidirá diretamente sobre o proveito econômico obtido pelo(a) CONTRATANTE.';
    }

    addClause('CLÁUSULA SEGUNDA – DOS HONORÁRIOS ADVOCATÍCIOS E CONDIÇÕES DE PAGAMENTO', [
      paymentClauseText,
      '2.2. O inadimplemento ou atraso no pagamento de qualquer parcela acarretará a incidência de multa moratória de 2% (dois por cento), juros de mora de 1% ao mês e atualização monetária até a data da efetiva quitação.',
      '2.3. Os honorários sucumbenciais eventualmente arbitrados pelo juízo em favor do patrono pertencem com exclusividade ao(à) CONTRATADO(A), nos termos do Art. 85 do Código de Processo Civil e do Art. 23 do Estatuto da OAB (Lei nº 8.906/94), sem qualquer compensação ou dedução com os honorários contratuais ora convencionados.',
    ]);

    // CLÁUSULA TERCEIRA - DAS CUSTAS E DESPESAS
    addClause('CLÁUSULA TERCEIRA – DAS CUSTAS PROCESSUAIS E DESPESAS', [
      '3.1. Todas as custas processuais, taxas judiciárias, despesas com diligências, traslados de certidões, emolumentos de cartório, honorários periciais, cópias e condução necessárias ao regular andamento da causa são de integral responsabilidade do(a) CONTRATANTE, exceto nos casos de concessão da Gratuidade da Justiça.',
    ]);

    // CLÁUSULA QUARTA - DAS OBRIGAÇÕES DAS PARTES
    addClause('CLÁUSULA QUARTA – DOS DEVERES DAS PARTES E SIGILO PROFISSIONAL', [
      '4.1. O(A) CONTRATANTE obriga-se a fornecer de forma tempestiva e verídica todos os documentos, informações e provas necessários ao desenvolvimento da defesa ou propositura da ação, mantendo seus contatos e endereço sempre atualizados.',
      '4.2. O(A) CONTRATADO(A) compromete-se a guardar absoluto sigilo profissional sobre todos os fatos e documentos que lhe forem confiados, pautando sua conduta nos ditames do Código de Ética e Disciplina da OAB.',
    ]);

    // CLÁUSULA QUINTA - DA RESCISÃO E REVOGAÇÃO
    addClause('CLÁUSULA QUINTA – DA RESCISÃO E REVOGAÇÃO DO MANDATO', [
      '5.1. A revogação do mandato judicial por vontade do(a) CONTRATANTE não o(a) exonera do pagamento proporcional dos honorários pactuados correspondentes aos serviços já prestados até a data da comunicação formal.',
    ]);

    // CLÁUSULA SEXTA - DO FORO
    const forum = caseItem.courtOrVara ? caseItem.courtOrVara.replace(/Vara|Juizado|Cível|Criminal|do Trabalho/gi, '').trim() : 'Comarca do Domicílio das Partes';
    addClause('CLÁUSULA SEXTA – DO FORO DE ELEIÇÃO', [
      `6.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da comarca de atuação, renunciando a qualquer outro, por mais privilegiado que seja.`,
    ]);

    // Final closing text & date
    checkPageBreak(45);
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    const dateFormatted = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`E, por estarem justos e contratados, firmam o presente instrumento em 2 (duas) vias de igual teor e forma.`, margin, y);
    y += 6;
    doc.text(`Data: ${dateFormatted}`, margin, y);
    y += 18;

    // Signature lines
    checkPageBreak(30);
    const sigLineWidth = (contentWidth - 15) / 2;

    // Client Signature Line
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + sigLineWidth, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text(clientName.toUpperCase(), margin + sigLineWidth / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text('CONTRATANTE', margin + sigLineWidth / 2, y + 8, { align: 'center' });
    if (caseItem.clientDocument) {
      doc.text(`Doc: ${caseItem.clientDocument}`, margin + sigLineWidth / 2, y + 11.5, { align: 'center' });
    }

    // Lawyer Signature Line
    const lawyerX = margin + sigLineWidth + 15;
    doc.line(lawyerX, y, lawyerX + sigLineWidth, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text(`DR(A). ${lawyerName.toUpperCase()}`, lawyerX + sigLineWidth / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text('CONTRATADO(A) - ADVOGADO(A)', lawyerX + sigLineWidth / 2, y + 8, { align: 'center' });
    if (profile.oabNumber) {
      doc.text(`OAB/${profile.oabState || 'UF'} ${profile.oabNumber}`, lawyerX + sigLineWidth / 2, y + 11.5, { align: 'center' });
    }

    return doc;
  },

  downloadContractPdf(caseItem: LegalCase, profile: LawyerProfile): void {
    const doc = this.generateContract(caseItem, profile);
    const sanitizedClientName = (caseItem.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedTitle = (caseItem.title || 'Contrato').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const filename = `Contrato_Honorarios_${sanitizedClientName}_${sanitizedTitle}.pdf`;
    doc.save(filename);
  },
};
