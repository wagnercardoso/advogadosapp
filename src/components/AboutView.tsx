import React from 'react';
import { JusticeLogo } from './JusticeLogo';
import { ShieldCheck, Phone, Mail, FileText, CheckCircle2, Award, Sparkles, Scale } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-16 h-16 mx-auto rounded-none bg-white/5 border border-[#C5A059]/40 p-2 flex items-center justify-center shadow-lg">
          <JusticeLogo size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-white font-['Cinzel',serif]">
          Tec Justiça <span className="text-[#C5A059]">Lite</span>
        </h2>
        <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
          Ambiente digital de alta produtividade jurídica para advogados, combinando agenda operacional com inteligência artificial para teses de defesa e enquadramento legal.
        </p>
      </div>

      {/* Corporate Info Card */}
      <div className="bg-[#050505] border border-white/10 rounded-none p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2 border-b border-white/10 pb-2">
          <Award size={14} /> Dados Oficiais da Empresa
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-white/50">Razão Social:</span>
            <span className="font-semibold text-white">Tectreinamentos Informática LTDA</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-white/50">CNPJ:</span>
            <span className="font-mono text-white font-semibold">40.963.840/0001-74</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-white/50">WhatsApp / Contato:</span>
            <a
              href="https://wa.me/5511982357631"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 font-mono"
            >
              <Phone size={12} />
              <span>55 (11) 98235-7631</span>
            </a>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-white/50">E-mail:</span>
            <a
              href="mailto:wagner.inst@gmail.com"
              className="text-[#C5A059] font-semibold hover:underline flex items-center gap-1"
            >
              <Mail size={12} />
              <span>wagner.inst@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Key Advantages */}
      <div className="bg-[#050505] border border-white/10 rounded-none p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2 border-b border-white/5 pb-2">
          <Sparkles size={14} /> Diferenciais do Tec Justiça Lite
        </h3>

        <div className="space-y-2.5 text-xs text-white/70">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Totalmente em Branco para Testes:</strong> O aplicativo inicia limpo, sem cadastros fictícios ou modelos invasivos, pronto para ser moldado às suas causas.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">IA Treinada na Legislação Brasileira:</strong> Sugestões de CPC, CP, CPP, CLT, CC, CF/88, CDC e Súmulas Vinculantes alinhadas ao seu perfil de atuação.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Roteiro e Teses de Defesa Passo a Passo:</strong> Estruturação de argumentos fáticos, preliminares, mérito e pedidos para fundamentar petições e audiências.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-[#C5A059] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Campo Dinâmico de Novas Circunstâncias:</strong> Permite adicionar novas provas e depoimentos a qualquer momento para recalcular a tese em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
