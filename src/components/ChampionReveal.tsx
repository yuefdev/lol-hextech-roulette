import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, RefreshCw } from 'lucide-react';
import {
  LANE_META,
  REGION_META,
  TAG_LABELS_TR,
  fetchChampionDetails,
  getChampionSplashUrl,
} from '../data/champions';
import type {
  Champion,
  ChampionDetails,
  Lane,
  YoutubeChallenge,
} from '../data/champions';
import type { BgMode } from './HextechScene3D';
import { LaneIcon } from './RoleBadgeBar';

interface ChampionRevealProps {
  champion: Champion;
  rolledLane: Lane | null;
  skinIndex: number;
  onSkinsLoaded?: (count: number, currentSkinName: string) => void;
  bgMode: BgMode;
  isVoicePlaying: boolean;
  challenge: YoutubeChallenge | null;
  onRerollChallenge: () => void;
}

export default function ChampionReveal({
  champion,
  rolledLane,
  skinIndex,
  onSkinsLoaded,
  bgMode,
  isVoicePlaying,
  challenge,
  onRerollChallenge,
}: ChampionRevealProps) {
  const [details, setDetails] = useState<ChampionDetails | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;

    fetchChampionDetails(champion.key, champion.id).then((d) => {
      if (active) {
        setDetails(d);
      }
    });

    return () => {
      active = false;
    };
  }, [champion.id, champion.key]);

  const skins = details?.skins?.length
    ? details.skins
    : [{ id: 0, name: 'Klasik', isBase: true, splashUrl: getChampionSplashUrl(champion.id, 0) }];

  const currentSkin = skins[skinIndex % skins.length] || skins[0];

  useEffect(() => {
    onSkinsLoaded?.(skins.length, currentSkin.name);
  }, [skins.length, currentSkin.name, onSkinsLoaded]);

  const regionInfo = REGION_META[champion.region];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    setParallax({ x: nx, y: ny });
  };

  const isGreenScreen = bgMode === 'greenscreen';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-20 flex flex-col justify-end overflow-hidden ${
        isGreenScreen ? 'bg-transparent items-center justify-center p-6' : 'bg-[#050608]'
      }`}
    >
      {/* Subtle golden lock-in flash */}
      <motion.div
        initial={{ opacity: 0.42 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,rgba(200,170,110,0.28)_0%,transparent_70%)]"
      />

      {isGreenScreen ? (
        /* GREENSCREEN CLEAN EDIT CARD */
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl overflow-hidden border border-[#C8AA6E]/70 bg-[#050608] shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
        >
          <div className="relative h-[420px] overflow-hidden">
            <img
              src={currentSkin.splashUrl}
              alt={champion.name}
              className="w-full h-full object-cover object-[50%_20%] brightness-[0.88] contrast-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/35 to-transparent" />
            <div className="absolute bottom-7 left-8 right-8">
              <div className="flex items-center gap-2.5 text-[11px] font-lol-tech tracking-[0.28em] uppercase text-[#C8AA6E] mb-1.5">
                {rolledLane && (
                  <span className="inline-flex items-center gap-1.5 text-[#F4EFE6]">
                    <LaneIcon lane={rolledLane} className="w-3.5 h-3.5" />
                    {LANE_META[rolledLane].label}
                  </span>
                )}
                <span>·</span>
                <span>{regionInfo.name}</span>
              </div>
              <h2 className="font-lol-display font-bold text-5xl sm:text-6xl gold-editorial-text leading-none">
                {champion.name}
              </h2>
              <p className="font-lol-display italic text-xl text-[#F4EFE6]/80 mt-1">
                {champion.title}
              </p>
              <p className="mt-3 font-lol-display italic text-lg text-[#F4EFE6]/90">
                “{champion.quote}”
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* PURE FULL-SCREEN DARK EDIT REVEAL (ZERO BOTTOM BUTTON BAR) */
        <>
          <div className="fixed inset-0 overflow-hidden pointer-events-none stage-3d">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSkin.splashUrl}
                initial={{ scale: 1.13, opacity: 0.2 }}
                animate={{ scale: 1.03, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full preserve-3d"
                style={{
                  transform: `translate3d(${-parallax.x * 18}px, ${-parallax.y * 12}px, 0) rotateY(${
                    parallax.x * 2.2
                  }deg) rotateX(${-parallax.y * 1.6}deg)`,
                  transition: 'transform 220ms ease-out',
                }}
              >
                <img
                  src={currentSkin.splashUrl}
                  alt={champion.name}
                  className="w-full h-full object-cover object-[56%_20%] brightness-[0.78] contrast-[1.1] saturate-[0.9]"
                />
              </motion.div>
            </AnimatePresence>

            {/* Deep Editorial Dark Vignettes */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,transparent_18%,rgba(5,6,8,0.72)_74%,rgba(5,6,8,0.96)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/45 to-[#050608]/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/92 via-[#050608]/30 to-transparent" />
            <div className="absolute inset-0 edit-grain opacity-50" />

            {/* Subtle 1px Architectural Hairline Frame */}
            <div className="absolute inset-5 sm:inset-8 border border-[#C8AA6E]/15 pointer-events-none" />
          </div>

          {/* Editorial Typography Block */}
          <div className="relative z-30 w-full max-w-7xl mx-auto px-7 sm:px-14 pb-12 sm:pb-16">
            <div className="max-w-3xl space-y-2.5">
              {/* Plain Tracked Eyebrow: Lane · Region · Class */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-lol-tech font-semibold tracking-[0.3em] uppercase text-[#C8AA6E]"
              >
                <span className="w-7 h-[1px] bg-[#C8AA6E]/80" />
                {rolledLane && (
                  <span className="inline-flex items-center gap-1.5 text-[#F4EFE6]">
                    <LaneIcon lane={rolledLane} className="w-3.5 h-3.5 text-[#C8AA6E]" />
                    {LANE_META[rolledLane].label}
                  </span>
                )}
                <span className="text-[#C8AA6E]/45">·</span>
                <span>{regionInfo.name}</span>
                <span className="text-[#C8AA6E]/45">·</span>
                <span className="text-[#F4EFE6]/65">
                  {champion.tags.map((t) => TAG_LABELS_TR[t] || t).join(' / ')}
                </span>
              </motion.div>

              {/* Hero Champion Name */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="font-lol-display font-bold text-5xl sm:text-7xl md:text-8xl tracking-wide gold-editorial-text leading-[0.95] drop-shadow-[0_14px_36px_rgba(0,0,0,0.95)]"
              >
                {champion.name}
              </motion.h1>

              {/* Turkish Title */}
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="font-lol-display italic text-xl sm:text-3xl text-[#F4EFE6]/80 tracking-wide"
              >
                {champion.title}
              </motion.p>

              {/* Movie-Subtitle Voice Line */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 }}
                className="pt-3 flex items-center gap-3.5"
              >
                <motion.div
                  animate={
                    isVoicePlaying
                      ? { scaleY: [0.6, 1.15, 0.75, 1.05, 0.6], opacity: 1 }
                      : { scaleY: 0.85, opacity: 0.55 }
                  }
                  transition={{
                    repeat: isVoicePlaying ? Infinity : 0,
                    duration: 0.75,
                    ease: 'easeInOut',
                  }}
                  className="w-[2px] h-6 bg-[#C8AA6E] shrink-0 origin-center"
                />
                <p className="font-lol-display italic text-lg sm:text-2xl text-[#F4EFE6]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  “{champion.quote}”
                </p>
              </motion.div>

              {/* Optional Challenge Line */}
              {challenge && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2 inline-flex items-center gap-2.5 text-xs text-[#E2CFA3]/90"
                >
                  <Flame className="w-3.5 h-3.5 text-[#C83E4D] shrink-0" />
                  <span className="font-semibold text-[#F4EFE6]">{challenge.title}:</span>
                  <span className="text-[#F4EFE6]/70">{challenge.description}</span>
                  <button
                    onClick={onRerollChallenge}
                    className="p-1 text-[#C8AA6E] hover:text-[#F4EFE6] cursor-pointer"
                    title="Görevi Değiştir"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
