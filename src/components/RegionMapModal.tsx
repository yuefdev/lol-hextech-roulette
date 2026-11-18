import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Trophy, Layers, RotateCcw, MapPin } from 'lucide-react';
import { CHAMPIONS, REGIONS, getChampionIconUrl } from '../data/champions';
import type { RegionId } from '../data/champions';

export type PoolFillMode = 'region_only' | 'min_pool';

interface RegionMapModalProps {
  open: boolean;
  onClose: () => void;
  activeRegions: RegionId[];
  multiSelect: boolean;
  poolFillMode: PoolFillMode;
  targetPoolSize: number;
  completedIds: Set<string>;
  winsCount: number;
  lossesCount: number;
  onSelectRegion: (regionId: RegionId) => void;
  onToggleMultiSelect: () => void;
  onSetPoolFillMode: (mode: PoolFillMode) => void;
  onSetTargetPoolSize: (size: number) => void;
  onSelectAllRegions: () => void;
  onResetProgress: () => void;
}

export default function RegionMapModal({
  open,
  onClose,
  activeRegions,
  multiSelect,
  poolFillMode,
  targetPoolSize,
  completedIds,
  winsCount,
  lossesCount,
  onSelectRegion,
  onToggleMultiSelect,
  onSetPoolFillMode,
  onSetTargetPoolSize,
  onSelectAllRegions,
  onResetProgress,
}: RegionMapModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const totalCompleted = completedIds.size;
  const totalChampions = CHAMPIONS.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.93, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl border border-[#C8AA6E]/55 bg-[#060B14] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#020408]/90 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0AC8B9]" />
                  <h2 className="font-lol-display font-bold text-2xl sm:text-3xl gold-editorial-text">
                    Runeterra Bölge İlerlemesi
                  </h2>
                </div>
                <p className="text-xs text-[#C8AA6E]/80 mt-0.5">
                  Her Win aldığın şampiyon havuzdan kalıcı olarak düşer · Tamamlanan:{' '}
                  <strong className="text-[#F0E6D2]">
                    {totalCompleted} / {totalChampions}
                  </strong>{' '}
                  · Seri Skoru:{' '}
                  <span className="text-[#2ECC71] font-bold">{winsCount}W</span> /{' '}
                  <span className="text-[#E84057] font-bold">{lossesCount}L</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-white/15 hover:border-[#0AC8B9] text-[#F0E6D2] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pool Strategy Controls */}
            <div className="p-4 border-b border-white/10 bg-[#040811] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onToggleMultiSelect}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-lol-tech font-bold cursor-pointer transition-all ${
                    multiSelect
                      ? 'border-[#0AC8B9] bg-[#0AC8B9]/15 text-[#0AC8B9]'
                      : 'border-white/15 bg-[#020408] text-[#F0E6D2]/80 hover:border-white/30'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {multiSelect ? 'Çoklu Bölge Seçimi: AÇIK' : 'Tek Bölge Seçimi'}
                </button>

                <button
                  onClick={onSelectAllRegions}
                  className="px-3 py-1.5 rounded-lg border border-[#C8AA6E]/35 bg-[#020408] hover:border-[#C8AA6E] text-xs font-lol-tech font-semibold text-[#C8AA6E] cursor-pointer"
                >
                  Tüm Bölgeler
                </button>
              </div>

              {/* GM Dynamic Min-Pool Option */}
              <div className="flex flex-wrap items-center gap-2 bg-[#020408] border border-white/10 rounded-xl px-3 py-1.5">
                <button
                  onClick={() =>
                    onSetPoolFillMode(poolFillMode === 'min_pool' ? 'region_only' : 'min_pool')
                  }
                  className={`px-2.5 py-1 rounded-md text-xs font-lol-tech font-bold cursor-pointer transition-all ${
                    poolFillMode === 'min_pool'
                      ? 'bg-[#C8AA6E] text-[#020408]'
                      : 'bg-white/5 text-[#F0E6D2]/70 hover:text-white'
                  }`}
                >
                  {poolFillMode === 'min_pool'
                    ? `Dinamik Havuz: Min ${targetPoolSize} Çar`
                    : 'Saf Bölge Modu'}
                </button>

                {poolFillMode === 'min_pool' && (
                  <div className="flex items-center gap-2 pl-1">
                    <input
                      type="range"
                      min={12}
                      max={35}
                      step={1}
                      value={targetPoolSize}
                      onChange={(e) => onSetTargetPoolSize(Number(e.target.value))}
                      className="w-24 accent-[#C8AA6E] cursor-pointer"
                    />
                    <span className="text-[11px] font-lol-tech text-[#0AC8B9] font-bold">
                      {targetPoolSize}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Regions Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {REGIONS.map((region) => {
                const regionChamps = CHAMPIONS.filter((c) => c.region === region.id);
                const remaining = regionChamps.filter((c) => !completedIds.has(c.id));
                const wonCount = regionChamps.length - remaining.length;
                const isDone = remaining.length === 0 && regionChamps.length > 0;
                const isSelected = activeRegions.includes(region.id);
                const pct =
                  regionChamps.length > 0 ? Math.round((wonCount / regionChamps.length) * 100) : 0;

                return (
                  <button
                    key={region.id}
                    onClick={() => onSelectRegion(region.id)}
                    className={`group relative rounded-xl p-3.5 border text-left transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10 shadow-[0_0_25px_rgba(10,200,185,0.2)]'
                        : isDone
                        ? 'border-[#2ECC71]/40 bg-[#020408]/60 opacity-75'
                        : 'border-white/10 bg-[#020408]/80 hover:border-[#C8AA6E]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: region.color,
                              boxShadow: `0 0 10px ${region.color}`,
                            }}
                          />
                          <span className="font-lol-display font-bold text-xl text-[#F0E6D2]">
                            {region.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C8AA6E]/75">{region.subtitle}</p>
                      </div>

                      {isDone ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2ECC71]/20 border border-[#2ECC71]/60 text-[10px] font-lol-tech font-bold text-[#2ECC71]">
                          <CheckCircle2 className="w-3 h-3" />
                          BİTTİ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-lol-tech font-bold text-[#F0E6D2]">
                          {remaining.length} / {regionChamps.length}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isDone ? '#2ECC71' : region.color,
                        }}
                      />
                    </div>

                    {/* Remaining Champion Mini Portraits */}
                    <div className="flex items-center gap-1 overflow-hidden">
                      {remaining.slice(0, 7).map((c) => (
                        <img
                          key={c.id}
                          src={getChampionIconUrl(c.id)}
                          alt={c.name}
                          title={c.name}
                          className="w-6 h-6 rounded-md object-cover border border-white/15"
                        />
                      ))}
                      {remaining.length > 7 && (
                        <span className="text-[10px] font-lol-tech text-[#C8AA6E] pl-1">
                          +{remaining.length - 7}
                        </span>
                      )}
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#2ECC71]/90">
                          <Trophy className="w-3.5 h-3.5" />
                          Bölge Fethedildi!
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Reset */}
            <div className="p-3.5 border-t border-white/10 bg-[#020408]/90 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-[#C8AA6E]/75">
                {poolFillMode === 'min_pool'
                  ? `Dinamik Mod: Seçili bölge + sıradaki bölgelerden min. ${targetPoolSize} şampiyonluk havuz oluşturur.`
                  : 'Saf Bölge Modu: Sadece seçili bölgeden kalan şampiyonlar çekilir.'}
              </span>

              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E84057] font-bold">Tüm winler silinsin mi?</span>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#E84057] text-white text-xs font-bold cursor-pointer"
                  >
                    Evet, Sıfırla
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#E84057]/60 text-xs text-[#F0E6D2]/70 hover:text-[#E84057] cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Seriyi Sıfırla
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
