import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, Ban, RotateCcw } from 'lucide-react';
import { getChampionIconUrl, LANE_META, TAG_LABELS_TR } from '../data/champions';
import type { Champion } from '../data/champions';

interface PoolManagerModalProps {
  open: boolean;
  onClose: () => void;
  champions: Champion[];
  excludedIds: Set<string>;
  onToggleExclude: (id: string) => void;
  onIncludeAll: () => void;
  onExcludeAll: () => void;
}

export default function PoolManagerModal({
  open,
  onClose,
  champions,
  excludedIds,
  onToggleExclude,
  onIncludeAll,
  onExcludeAll,
}: PoolManagerModalProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return champions;
    return champions.filter(
      (c) =>
        c.name.toLocaleLowerCase('tr-TR').includes(q) ||
        c.title.toLocaleLowerCase('tr-TR').includes(q)
    );
  }, [champions, query]);

  const activeCount = champions.length - excludedIds.size;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-[#C8AA6E]/60 bg-[#091428] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#C8AA6E]/25 bg-[#010A13]/80 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-lol-display font-bold text-2xl text-[#F0E6D2]">
                  Şampiyon Havuzu & Yasaklama
                </h3>
                <p className="text-xs text-[#C8AA6E]">
                  Çarkta çıkmasını istemediğin veya sahip olmadığın şampiyonları tıkla ({activeCount} /{' '}
                  {champions.length} aktif)
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-[#C8AA6E]/30 hover:border-[#0AC8B9] text-[#F0E6D2] hover:text-[#0AC8B9] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Batch Controls */}
            <div className="p-4 border-b border-white/10 bg-[#060F1E] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-[#C8AA6E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Şampiyon ara (ör. Yasuo, Ahri, Jinx...)"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#010A13] border border-[#C8AA6E]/35 focus:border-[#0AC8B9] outline-none text-sm text-[#F0E6D2] placeholder-[#C8AA6E]/45"
                />
              </div>

              <button
                onClick={onIncludeAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0AC8B9]/15 hover:bg-[#0AC8B9]/25 border border-[#0AC8B9]/50 text-xs font-lol-tech font-semibold text-[#0AC8B9] cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tümünü Aç
              </button>
              <button
                onClick={onExcludeAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E84057]/15 hover:bg-[#E84057]/25 border border-[#E84057]/50 text-xs font-lol-tech font-semibold text-[#E84057] cursor-pointer transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                Tümünü Kapat
              </button>
              {excludedIds.size > 0 && (
                <button
                  onClick={onIncludeAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#C8AA6E]/15 hover:bg-[#C8AA6E]/25 border border-[#C8AA6E]/40 text-xs font-lol-tech font-semibold text-[#F0E6D2] cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Yasakları Sıfırla
                </button>
              )}
            </div>

            {/* Champion Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
              {filtered.map((c) => {
                const isExcluded = excludedIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => onToggleExclude(c.id)}
                    className={`group relative rounded-xl p-2 border text-left transition-all cursor-pointer ${
                      isExcluded
                        ? 'border-[#E84057]/40 bg-[#010A13]/40 opacity-50 grayscale hover:opacity-80'
                        : 'border-[#C8AA6E]/35 bg-[#010A13]/85 hover:border-[#0AC8B9] hover:bg-[#0AC8B9]/10'
                    }`}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 bg-black">
                      <img
                        src={getChampionIconUrl(c.id)}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isExcluded && (
                        <div className="absolute inset-0 bg-[#E84057]/35 flex items-center justify-center">
                          <Ban className="w-7 h-7 text-[#E84057] drop-shadow" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#F0E6D2] truncate">{c.name}</div>
                    <div className="text-[10px] text-[#C8AA6E]/80 truncate">
                      {c.lanes.map((l) => LANE_META[l].short).join('/')} · {TAG_LABELS_TR[c.tags[0]]}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
