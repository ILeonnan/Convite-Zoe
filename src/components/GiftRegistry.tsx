'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, BookOpen, Shirt, Sparkles, Heart, ChevronDown } from 'lucide-react';
import { logAnalyticsEventAction } from '@/app/actions';

interface GiftRegistryProps {
  familyId: string;
}

export default function GiftRegistry({ familyId }: GiftRegistryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChosenOther, setHasChosenOther] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);

  const toggleAccordion = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !hasLogged) {
      setHasLogged(true);
      await logAnalyticsEventAction(familyId, 'gift_viewed');
    }
  };

  const categories = [
    {
      icon: <Sparkles className="w-5 h-5 text-golden-honey shrink-0" />,
      title: "Brinquedos",
      description: "Brinquedos interativos, blocos de montar ou estimulantes de coordenação.",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-golden-honey shrink-0" />,
      title: "Livros",
      description: "Livros de historinhas ilustradas, com texturas ou contos sonoros.",
    },
    {
      icon: <Shirt className="w-5 h-5 text-golden-honey shrink-0" />,
      title: "Roupinhas",
      description: "Tamanho de 1 a 2 anos. De preferência tecidos leves, algodão e confortáveis.",
    },
    {
      icon: <Gift className="w-5 h-5 text-golden-honey shrink-0" />,
      title: "Itens Educativos",
      description: "Jogos sensoriais, encaixes de madeira e brinquedos de estimulação sensorial.",
    },
  ];

  return (
    <div className="bg-daisy-white border border-rose-cream/40 rounded-3xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={toggleAccordion}
        className="w-full p-6 flex items-center justify-between font-bold text-soft-brown hover:bg-rose-cream/10 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Gift className="w-5 h-5 text-golden-honey" />
          <span className="font-title text-xl">Sugestões de Presentes</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-soft-brown/50" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 space-y-4 border-t border-rose-cream/10 pt-4">
          <p className="text-xs text-soft-brown/70 leading-relaxed">
            Se você estiver em dúvida sobre o que dar para a Zoe, aqui estão algumas sugestões das coisas que ela mais está aproveitando no momento:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="p-3 bg-vanilla-white/50 border border-rose-cream/15 rounded-2xl flex items-start gap-2.5"
              >
                {cat.icon}
                <div>
                  <h4 className="text-xs font-bold text-soft-brown uppercase tracking-wider">{cat.title}</h4>
                  <p className="text-xs text-soft-brown/75 leading-normal mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-rose-cream/15">
            {!hasChosenOther ? (
              <button
                type="button"
                onClick={() => setHasChosenOther(true)}
                className="w-full py-3 bg-rose-cream/40 hover:bg-rose-cream/70 text-soft-brown/90 font-bold rounded-2xl transition duration-200 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4.5 h-4.5 text-rose-400 fill-rose-400" /> Já escolhi outro presente ❤️
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-cream/35 border border-rose-cream/40 rounded-2xl text-center space-y-1"
              >
                <p className="text-sm font-bold text-soft-brown">Que lindo! 🥰</p>
                <p className="text-xs text-soft-brown/80 leading-relaxed">
                  Mal podemos esperar para ver seu carinho com a Zoe. Seu abraço e sua presença são o mais importante para nós!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
