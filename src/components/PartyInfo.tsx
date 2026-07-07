'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Shirt, Info, Compass } from 'lucide-react';
import { logAnalyticsEventAction } from '@/app/actions';

interface PartyInfoProps {
  familyId: string;
}

export default function PartyInfo({ familyId }: PartyInfoProps) {
  const [hoveredMap, setHoveredMap] = useState<string | null>(null);
  const handleMapClick = async () => {
    await logAnalyticsEventAction(familyId, 'location_opened');
  };

  const address = "Buffet Doce Colmeia - Av. das Margaridas, 789 - Jardim do Sol, São Paulo";
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
  const appleMapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(address)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-daisy-white border border-rose-cream/40 p-6 md:p-8 rounded-3xl shadow-sm space-y-6"
    >
      <h2 className="font-title text-2xl text-soft-brown text-center font-bold">
        Detalhes da Celebração
      </h2>

      <div className="space-y-4 text-sm md:text-base">
        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-golden-honey shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-soft-brown text-xs md:text-sm uppercase tracking-wider">Data</p>
            <p className="text-soft-brown/80 text-sm">Sábado, 24 de Outubro de 2026</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-golden-honey shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-soft-brown text-xs md:text-sm uppercase tracking-wider">Horário</p>
            <p className="text-soft-brown/80 text-sm">A partir das 16:00</p>
          </div>
        </div>

        {/* Local */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-golden-honey shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-soft-brown text-xs md:text-sm uppercase tracking-wider">Local</p>
            <p className="text-soft-brown/80 text-sm">{address}</p>
          </div>
        </div>

        {/* Traje */}
        <div className="flex items-start gap-3">
          <Shirt className="w-5 h-5 text-golden-honey shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-soft-brown text-xs md:text-sm uppercase tracking-wider">Sugestão de Traje</p>
            <p className="text-soft-brown/80 text-sm">Esporte fino ou tons pastéis / terrosos (para combinarmos com o jardim da Zoe! 🌼)</p>
          </div>
        </div>

        {/* Observações */}
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-golden-honey shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-soft-brown text-xs md:text-sm uppercase tracking-wider">Observações</p>
            <p className="text-soft-brown/80 text-sm">Pedimos que confirme sua presença até o dia 10 de Outubro para organizarmos nossa colmeia.</p>
          </div>
        </div>
      </div>

      {/* Map Buttons */}
      <div className="pt-4 border-t border-rose-cream/20 space-y-3">
        <p className="text-xs text-center text-soft-brown/60 font-bold flex items-center justify-center gap-1 uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" /> Como chegar:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Google Maps */}
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMapClick}
            onMouseEnter={() => setHoveredMap('google')}
            onMouseLeave={() => setHoveredMap(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center justify-center gap-2 py-2.5 px-3 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/40 rounded-xl text-xs font-bold text-soft-brown transition shadow-xs cursor-pointer text-center overflow-hidden h-10"
          >
            <AnimatePresence>
              {hoveredMap === 'google' && (
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 text-sm"
                >
                  🐝
                </motion.span>
              )}
            </AnimatePresence>
            <span className={hoveredMap === 'google' ? 'pl-4 transition-all duration-200' : 'transition-all duration-200'}>
              Google Maps
            </span>
          </motion.a>

          {/* Waze */}
          <motion.a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMapClick}
            onMouseEnter={() => setHoveredMap('waze')}
            onMouseLeave={() => setHoveredMap(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center justify-center gap-2 py-2.5 px-3 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/40 rounded-xl text-xs font-bold text-soft-brown transition shadow-xs cursor-pointer text-center overflow-hidden h-10"
          >
            <AnimatePresence>
              {hoveredMap === 'waze' && (
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 text-sm"
                >
                  🐝
                </motion.span>
              )}
            </AnimatePresence>
            <span className={hoveredMap === 'waze' ? 'pl-4 transition-all duration-200' : 'transition-all duration-200'}>
              Waze
            </span>
          </motion.a>

          {/* Apple Maps */}
          <motion.a
            href={appleMapsUrl}
            onClick={handleMapClick}
            onMouseEnter={() => setHoveredMap('apple')}
            onMouseLeave={() => setHoveredMap(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center justify-center gap-2 py-2.5 px-3 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/40 rounded-xl text-xs font-bold text-soft-brown transition shadow-xs cursor-pointer text-center overflow-hidden h-10"
          >
            <AnimatePresence>
              {hoveredMap === 'apple' && (
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 text-sm"
                >
                  🐝
                </motion.span>
              )}
            </AnimatePresence>
            <span className={hoveredMap === 'apple' ? 'pl-4 transition-all duration-200' : 'transition-all duration-200'}>
              Apple Maps
            </span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
