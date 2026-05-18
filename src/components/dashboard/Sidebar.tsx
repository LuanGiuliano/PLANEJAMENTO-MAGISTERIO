import { 
  LayoutDashboard, Target, BarChart3, 
  Users, UserMinus, ArrowRightLeft, HeartPulse, 
  FileText, Settings, ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuGroups = [
    {
      title: "Gestão",
      items: [
        // 👇 AQUI ESTÁ A MÁGICA: id alterado para 'executivo'
        { id: 'executivo', label: 'Dashboard Executivo', icon: LayoutDashboard },
        { id: 'planejamento', label: 'Planejamento Estratégico', icon: Target },
        { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
      ]
    },
    {
      title: "Servidores",
      items: [
        { id: 'lotacao', label: 'Lotação', icon: Users },
        { id: 'cedidos', label: 'Cedidos', icon: UserMinus },
        { id: 'movimentacoes', label: 'Movimentações', icon: ArrowRightLeft },
        { id: 'readaptacoes', label: 'Readaptações', icon: HeartPulse },
      ]
    },
    {
      title: "Administração",
      items: [
        { id: 'relatorios', label: 'Relatórios', icon: FileText },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#102A43] border-r border-white/5 flex flex-col h-full relative overflow-hidden">
      
      {/* ELEMENTO AMAZÔNICO - BANDEIRA DO PARÁ (Geometria CSS Discreta) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.04]">
        {/* Faixa Branca Diagonal da Bandeira */}
        <div className="absolute -left-20 top-2/3 w-[200%] h-40 bg-white -rotate-[35deg] transform origin-bottom-left blur-[1px]"></div>
        {/* Estrela da Bandeira Spica */}
        <div className="absolute left-1/2 bottom-24 transform -translate-x-1/2">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </div>
      
      {/* Overlay para mesclar com o azul e deixar super elegante */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#081C2E]/80 to-transparent pointer-events-none z-0"></div>

      {/* CONTEÚDO DA SIDEBAR */}
      <div className="p-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* LOGO SIAE */}
        <div className="flex items-center gap-3 mb-10 mt-2">
          <div className="h-8 w-1.5 bg-[#C62828] rounded-sm"></div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#F5F7FA] tracking-tighter leading-none">SIAE</span>
            <span className="text-[10px] text-[#F4A300] font-bold uppercase tracking-widest leading-none mt-1">SEDUC PA</span>
          </div>
        </div>

        <nav className="space-y-8">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-[10px] font-bold text-[#F5F7FA]/40 uppercase tracking-widest mb-3 pl-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative ${
                        isActive 
                        ? 'bg-[#132F4C] text-[#F5F7FA] shadow-sm border border-white/5' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-[#F5F7FA]'
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeTabMarker" className="absolute left-0 top-2 bottom-2 w-1 bg-[#C62828] rounded-r-md"></motion.div>
                      )}
                      <Icon size={16} className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#F4A300]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-[#F5F7FA]' : ''}`}>
                        {item.label}
                      </span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-slate-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}