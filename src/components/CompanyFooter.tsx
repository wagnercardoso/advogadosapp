import React from 'react';
import { JusticeLogo } from './JusticeLogo';
import { Phone, Mail, FileText, ExternalLink, ShieldCheck, Award } from 'lucide-react';

export const CompanyFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 py-8 px-4 text-xs text-white/50 mt-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top brand row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded-none bg-white/5 border border-[#C5A059]/40 shadow-sm">
              <JusticeLogo size={32} />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white font-['Cinzel',serif] uppercase tracking-widest">
                Tec Justiça <span className="text-[#C5A059] text-xs font-semibold">Lite</span>
              </h3>
              <p className="text-[11px] text-white/50">
                Solução de Inteligência Jurídica & Agenda Funcional para Advogados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/5 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider border border-[#C5A059]/30 flex items-center gap-1.5">
              <ShieldCheck size={13} /> Sistema em Conformidade OAB & LGPD
            </span>
          </div>
        </div>

        {/* Corporate Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Company Details */}
          <div className="space-y-1.5 bg-[#0a0a0a] p-4 rounded-none border border-white/10">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px] flex items-center gap-1.5 text-[#C5A059]">
              <FileText size={13} /> Dados Empresariais
            </h4>
            <p className="text-white font-medium pt-1">
              Tectreinamentos Informática LTDA
            </p>
            <p className="text-white/60">
              <strong className="text-white/80">CNPJ:</strong> 40.963.840/0001-74
            </p>
            <p className="text-[10px] text-white/40 pt-1">
              Desenvolvimento de softwares inteligentes e tecnologia para a advocacia.
            </p>
          </div>

          {/* WhatsApp Direct Contact */}
          <div className="space-y-1.5 bg-[#0a0a0a] p-4 rounded-none border border-white/10">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px] flex items-center gap-1.5 text-[#C5A059]">
              <Phone size={13} /> Atendimento & WhatsApp
            </h4>
            <p className="text-white font-mono font-medium pt-1">
              55 (11) 98235-7631
            </p>
            <a
              href="https://wa.me/5511982357631"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold hover:underline pt-1"
            >
              <span>Conversar pelo WhatsApp</span>
              <ExternalLink size={11} />
            </a>
            <p className="text-[10px] text-white/40">
              Suporte técnico e consultoria de implantação.
            </p>
          </div>

          {/* Email & Support */}
          <div className="space-y-1.5 bg-[#0a0a0a] p-4 rounded-none border border-white/10">
            <h4 className="font-bold text-white uppercase tracking-widest text-[10px] flex items-center gap-1.5 text-[#C5A059]">
              <Mail size={13} /> E-mail Oficial
            </h4>
            <p className="text-white font-medium pt-1">
              wagner.inst@gmail.com
            </p>
            <a
              href="mailto:wagner.inst@gmail.com"
              className="inline-flex items-center gap-1 text-[#C5A059] hover:underline text-[11px] font-semibold pt-1"
            >
              <span>Enviar e-mail</span>
              <ExternalLink size={11} />
            </a>
            <p className="text-[10px] text-white/40">
              Dúvidas comerciais e parcerias institucionais.
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center pt-2 text-[10px] text-white/30 border-t border-white/5 uppercase tracking-wider font-mono">
          <p>© {new Date().getFullYear()} Tec Justiça Lite • Tectreinamentos Informática LTDA • Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
