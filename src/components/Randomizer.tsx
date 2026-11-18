import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Eye,
  EyeOff,
  X,
  Disc3,
  GalleryHorizontalEnd,
  Flame,
  Monitor,
  Trash2,
  MapPin,
  Trophy,
  Dices,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  CHAMPIONS,
  REGIONS,
  REGION_META,
  TAG_LABELS_TR,
  YOUTUBE_CHALLENGES,
  getBanVoUrl,
  getChampionIconUrl,
  getChooseVoUrl,
  getLockInSfxUrl,
} from '../data/champions';
import type {
  Champion,
  ChampionTag,
  Lane,
  RegionId,
  YoutubeChallenge,
} from '../data/champions';
import HextechScene3D from './HextechScene3D';
import type { BgMode, StagePhase } from './HextechScene3D';
import SpinStage from './SpinStage';
import type { SpinMode, SpinSpeed } from './SpinStage';
import ChampionReveal from './ChampionReveal';
import PoolManagerModal from './PoolManagerModal';
import RegionMapModal from './RegionMapModal';
import type { PoolFillMode } from './RegionMapModal';
import RoleBadgeBar from './RoleBadgeBar';
import { soundEngine } from '../utils/soundEngine';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

const ALL_LANES: Lane[] = ['top', 'jungle', 'mid', 'adc', 'support'];
const ALL_TAGS: ChampionTag[] = ['Fighter', 'Mage', 'Assassin', 'Tank', 'Marksman', 'Support'];
const STORAGE_KEY = 'lol_hextech_series_v1';

interface SavedProgress {
  completedIds: string[];
  activeRegions: RegionId[];
  multiSelect: boolean;
  poolFillMode: PoolFillMode;
  targetPoolSize: number;
  winsCount: number;
  lossesCount: number;
}

function loadSavedProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedProgress>;
      return {
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
        activeRegions:
          Array.isArray(parsed.activeRegions) && parsed.activeRegions.length > 0
            ? (parsed.activeRegions as RegionId[])
            : ['ixtal'],
        multiSelect: Boolean(parsed.multiSelect),
        poolFillMode: parsed.poolFillMode === 'min_pool' ? 'min_pool' : 'region_only',
        targetPoolSize:
          typeof parsed.targetPoolSize === 'number' ? parsed.targetPoolSize : 22,
        winsCount: typeof parsed.winsCount === 'number' ? parsed.winsCount : 0,
        lossesCount: typeof parsed.lossesCount === 'number' ? parsed.lossesCount : 0,
      };
    }
  } catch {
    // ignore corrupted storage
  }
  return {
    completedIds: [],
    activeRegions: ['ixtal'],
    multiSelect: false,
    poolFillMode: 'region_only',
    targetPoolSize: 22,
    winsCount: 0,
    lossesCount: 0,
  };
}

export default function Randomizer() {
  const initialProgress = useMemo(() => loadSavedProgress(), []);

  // Series & Region Progression State
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialProgress.completedIds)
  );
  const [activeRegions, setActiveRegions] = useState<RegionId[]>(
    initialProgress.activeRegions
  );
  const [multiSelectRegions, setMultiSelectRegions] = useState(
    initialProgress.multiSelect
  );
  const [poolFillMode, setPoolFillMode] = useState<PoolFillMode>(
    initialProgress.poolFillMode
  );
  const [targetPoolSize, setTargetPoolSize] = useState(
    initialProgress.targetPoolSize
  );
  const [winsCount, setWinsCount] = useState(initialProgress.winsCount);
  const [lossesCount, setLossesCount] = useState(initialProgress.lossesCount);
  const [regionClearedBanner, setRegionClearedBanner] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: SavedProgress = {
        completedIds: Array.from(completedIds),
        activeRegions,
        multiSelect: multiSelectRegions,
        poolFillMode,
        targetPoolSize,
        winsCount,
        lossesCount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [
    completedIds,
    activeRegions,
    multiSelectRegions,
    poolFillMode,
    targetPoolSize,
    winsCount,
    lossesCount,
  ]);

  // Stage & Spin State
  const [phase, setPhase] = useState<StagePhase>('idle');
  const [spinMode, setSpinMode] = useState<SpinMode>('carousel3d');
  const [spinSpeed, setSpinSpeed] = useState<SpinSpeed>('normal');
  const [bgMode, setBgMode] = useState<BgMode>('hextech');
  const [hideHud, setHideHud] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [poolModalOpen, setPoolModalOpen] = useState(false);

  const [spinTrigger, setSpinTrigger] = useState(0);
  const [targetChampion, setTargetChampion] = useState<Champion | null>(null);
  const [revealedChampion, setRevealedChampion] = useState<Champion | null>(null);
  const [skinIndex, setSkinIndex] = useState(0);
  const [skinCount, setSkinCount] = useState(1);
  const [skinName, setSkinName] = useState('Klasik');
  const [history, setHistory] = useState<Champion[]>([]);

  // Random Role State
  const [randomRoleEnabled, setRandomRoleEnabled] = useState(true);
  const [filterChampByRolledRole, setFilterChampByRolledRole] = useState(false);
  const [enabledRoles, setEnabledRoles] = useState<Set<Lane>>(() => new Set(ALL_LANES));
  const [isRollingRole, setIsRollingRole] = useState(false);
  const [highlightedLane, setHighlightedLane] = useState<Lane | null>(null);
  const [lockedLane, setLockedLane] = useState<Lane | null>(null);
  const roleTimerRef = useRef<number>(0);

  // Additional Filters
  const [tagFilter, setTagFilter] = useState<ChampionTag | 'all'>('all');
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => new Set());

  // YouTube Challenge Mode
  const [challengeMode, setChallengeMode] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<YoutubeChallenge | null>(null);

  // Audio & Voiceover State
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [voiceLang, setVoiceLang] = useState<'tr_tr' | 'default'>('tr_tr');
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  // VoiceCom (Microphone Speech Commands)
  const [voiceComEnabled, setVoiceComEnabled] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [wakeWord, setWakeWord] = useState('hextech');

  const { activePool, primaryRegionRemaining, primaryRegionTotal } = useMemo(() => {
    const isAvailable = (c: Champion) => {
      if (completedIds.has(c.id)) return false;
      if (excludedIds.has(c.id)) return false;
      if (tagFilter !== 'all' && !c.tags.includes(tagFilter)) return false;
      return true;
    };

    const primaryRegionChamps = CHAMPIONS.filter((c) => activeRegions.includes(c.region));
    const primaryRemainingList = primaryRegionChamps.filter(isAvailable);

    const pool = [...primaryRemainingList];

    if (poolFillMode === 'min_pool' && pool.length < targetPoolSize) {
      const inPoolIds = new Set(pool.map((c) => c.id));
      for (const reg of REGIONS) {
        if (pool.length >= targetPoolSize) break;
        if (activeRegions.includes(reg.id)) continue;
        const extras = CHAMPIONS.filter(
          (c) => c.region === reg.id && !inPoolIds.has(c.id) && isAvailable(c)
        );
        for (const extra of extras) {
          if (pool.length >= targetPoolSize) break;
          pool.push(extra);
          inPoolIds.add(extra.id);
        }
      }
    }

    return {
      activePool: pool,
      primaryRegionRemaining: primaryRemainingList.length,
      primaryRegionTotal: primaryRegionChamps.length,
    };
  }, [activeRegions, completedIds, excludedIds, poolFillMode, tagFilter, targetPoolSize]);

  const rollChallenge = useCallback(() => {
    const idx = Math.floor(Math.random() * YOUTUBE_CHALLENGES.length);
    setActiveChallenge(YOUTUBE_CHALLENGES[idx]);
  }, []);

  const playChampionPickVoice = useCallback(
    (champ: Champion, lang: 'tr_tr' | 'default' = voiceLang) => {
      soundEngine.playVoiceLine(getChooseVoUrl(champ.key, lang), {
        fallbackUrl: getChooseVoUrl(champ.key, lang === 'tr_tr' ? 'default' : 'tr_tr'),
        fallbackSpeechText: `${champ.name}. ${champ.quote}`,
        onStart: () => setIsVoicePlaying(true),
        onEnd: () => setIsVoicePlaying(false),
      });
    },
    [voiceLang]
  );

  const playChampionBanVoice = useCallback(
    (champ: Champion, lang: 'tr_tr' | 'default' = voiceLang) => {
      soundEngine.playVoiceLine(getBanVoUrl(champ.key, lang), {
        fallbackUrl: getBanVoUrl(champ.key, lang === 'tr_tr' ? 'default' : 'tr_tr'),
        fallbackSpeechText: champ.quote,
        onStart: () => setIsVoicePlaying(true),
        onEnd: () => setIsVoicePlaying(false),
      });
    },
    [voiceLang]
  );

  const phaseRef = useRef(phase);
  const poolRef = useRef(activePool);
  const enabledRolesRef = useRef(enabledRoles);
  const randomRoleRef = useRef(randomRoleEnabled);
  const filterByRoleRef = useRef(filterChampByRolledRole);

  useEffect(() => {
    phaseRef.current = phase;
    poolRef.current = activePool;
    enabledRolesRef.current = enabledRoles;
    randomRoleRef.current = randomRoleEnabled;
    filterByRoleRef.current = filterChampByRolledRole;
  }, [phase, activePool, enabledRoles, randomRoleEnabled, filterChampByRolledRole]);

  const startSpin = useCallback(() => {
    if (phaseRef.current === 'spinning') return;
    const currentPool = poolRef.current;
    if (currentPool.length === 0) {
      soundEngine.playUiClick();
      setRegionModalOpen(true);
      return;
    }

    window.clearInterval(roleTimerRef.current);
    setDrawerOpen(false);
    setRegionModalOpen(false);
    soundEngine.stopVoice();
    setIsVoicePlaying(false);
    soundEngine.playSpinStart();

    const roleChoices = ALL_LANES.filter((l) => enabledRolesRef.current.has(l));
    const chosenRole =
      randomRoleRef.current && roleChoices.length > 0
        ? roleChoices[Math.floor(Math.random() * roleChoices.length)]
        : null;

    if (chosenRole) {
      setLockedLane(null);
      setIsRollingRole(true);
      let step = 0;
      const maxSteps = 9;
      roleTimerRef.current = window.setInterval(() => {
        step += 1;
        if (step < maxSteps) {
          const cyclePool = roleChoices.length > 0 ? roleChoices : ALL_LANES;
          setHighlightedLane(cyclePool[step % cyclePool.length]);
          soundEngine.playRoleTick();
        } else {
          window.clearInterval(roleTimerRef.current);
          setIsRollingRole(false);
          setHighlightedLane(chosenRole);
          setLockedLane(chosenRole);
          soundEngine.playRoleLock();
        }
      }, 85);
    } else {
      setIsRollingRole(false);
      setHighlightedLane(null);
      setLockedLane(null);
    }

    let champCandidates = currentPool;
    if (chosenRole && filterByRoleRef.current) {
      const roleMatched = currentPool.filter((c) => c.lanes.includes(chosenRole));
      if (roleMatched.length > 0) champCandidates = roleMatched;
    }

    const chosen = champCandidates[Math.floor(Math.random() * champCandidates.length)];
    setTargetChampion(chosen);
    setRevealedChampion(null);
    setSkinIndex(0);
    setSkinCount(1);
    setSkinName('Klasik');
    setPhase('spinning');
    setSpinTrigger((n) => n + 1);
  }, []);

  const handleSpinComplete = useCallback(
    (champ: Champion) => {
      setRevealedChampion(champ);
      setPhase('revealed');

      if (challengeMode) {
        rollChallenge();
      } else {
        setActiveChallenge(null);
      }

      setHistory((prev) => [champ, ...prev.filter((c) => c.id !== champ.id)].slice(0, 14));

      soundEngine.playLockIn();
      soundEngine.playSfxUrl(getLockInSfxUrl(champ.key));
      setTimeout(() => {
        playChampionPickVoice(champ);
      }, 260);
    },
    [challengeMode, playChampionPickVoice, rollChallenge]
  );

  const handleClaimWin = useCallback(() => {
    if (!revealedChampion) return;
    soundEngine.stopVoice();
    setIsVoicePlaying(false);
    soundEngine.playVictoryWin();

    const wonChamp = revealedChampion;
    const nextCompleted = new Set(completedIds);
    nextCompleted.add(wonChamp.id);
    setCompletedIds(nextCompleted);
    setWinsCount((w) => w + 1);

    const regionRemainingAfter = CHAMPIONS.filter(
      (c) => c.region === wonChamp.region && !nextCompleted.has(c.id)
    ).length;

    if (regionRemainingAfter === 0) {
      const regName = REGION_META[wonChamp.region].name.toUpperCase();
      setRegionClearedBanner(`${regName} BÖLGESİ TAMAMLANDI`);
      setTimeout(() => setRegionClearedBanner(null), 3500);

      if (!multiSelectRegions && activeRegions.length === 1 && activeRegions[0] === wonChamp.region) {
        const nextReg = REGIONS.find((r) =>
          CHAMPIONS.some((c) => c.region === r.id && !nextCompleted.has(c.id))
        );
        if (nextReg) {
          setActiveRegions([nextReg.id]);
        }
      }
    }

    setPhase('idle');
    setRevealedChampion(null);
    setLockedLane(null);
    setHighlightedLane(null);
  }, [activeRegions, completedIds, multiSelectRegions, revealedChampion]);

  const handleLoseAndReroll = useCallback(() => {
    setLossesCount((l) => l + 1);
    startSpin();
  }, [startSpin]);

  useEffect(() => {
    soundEngine.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    return () => window.clearInterval(roleTimerRef.current);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        startSpin();
      } else if (e.key === 'h' || e.key === 'H') {
        setHideHud((h) => !h);
      } else if (e.key === 'v' || e.key === 'V') {
        setVoiceComEnabled((v) => !v);
      } else if ((e.key === 'w' || e.key === 'W') && phase === 'revealed' && revealedChampion) {
        handleClaimWin();
      } else if ((e.key === 'r' || e.key === 'R') && revealedChampion) {
        playChampionPickVoice(revealedChampion);
      } else if (e.key === 'Escape' && phase === 'revealed') {
        soundEngine.stopVoice();
        setIsVoicePlaying(false);
        setPhase('idle');
      } else if (e.key === 'ArrowRight' && phase === 'revealed' && skinCount > 1) {
        setSkinIndex((i) => (i + 1) % skinCount);
      } else if (e.key === 'ArrowLeft' && phase === 'revealed' && skinCount > 1) {
        setSkinIndex((i) => (i - 1 + skinCount) % skinCount);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [startSpin, phase, revealedChampion, playChampionPickVoice, handleClaimWin, skinCount]);

  const voiceState = useVoiceCommands({
    enabled: voiceComEnabled,
    wakeWordEnabled,
    wakeWord,
    actions: {
      onSpin: startSpin,
      onClaimWin: () => {
        if (phaseRef.current === 'revealed') handleClaimWin();
      },
      onPlayPickVo: () => {
        if (revealedChampion) playChampionPickVoice(revealedChampion);
      },
      onPlayBanVo: () => {
        if (revealedChampion) playChampionBanVoice(revealedChampion);
      },
      onSetLane: (lane) => {
        if (lane === 'all') {
          setEnabledRoles(new Set(ALL_LANES));
        } else {
          setEnabledRoles(new Set([lane]));
        }
        soundEngine.playUiClick();
      },
      onSetTag: (tag) => {
        setTagFilter(tag);
        soundEngine.playUiClick();
      },
      onToggleCinemaMode: (val) => {
        setHideHud((prev) => (val !== undefined ? val : !prev));
      },
    },
  });

  const handleToggleRole = (lane: Lane) => {
    soundEngine.playUiClick();
    setEnabledRoles((prev) => {
      const next = new Set(prev);
      if (next.has(lane)) {
        if (next.size > 1) next.delete(lane);
      } else {
        next.add(lane);
      }
      return next;
    });
  };

  const handleSelectRegion = (regionId: RegionId) => {
    soundEngine.playUiClick();
    if (multiSelectRegions) {
      setActiveRegions((prev) => {
        if (prev.includes(regionId)) {
          return prev.length > 1 ? prev.filter((r) => r !== regionId) : prev;
        }
        return [...prev, regionId];
      });
    } else {
      setActiveRegions([regionId]);
      setRegionModalOpen(false);
    }
  };

  const handleToggleExclude = (id: string) => {
    soundEngine.playUiClick();
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResetProgress = () => {
    soundEngine.playUiClick();
    setCompletedIds(new Set());
    setWinsCount(0);
    setLossesCount(0);
    setActiveRegions(['ixtal']);
    setMultiSelectRegions(false);
  };

  const handleSkinsLoaded = useCallback((count: number, name: string) => {
    setSkinCount(count);
    setSkinName(name);
  }, []);

  const activeRegionLabel =
    activeRegions.length === REGIONS.length
      ? 'TÜM RUNETERRA'
      : activeRegions.length === 1
      ? REGION_META[activeRegions[0]].name.toUpperCase()
      : `${activeRegions.length} BÖLGE`;

  const isReveal = phase === 'revealed' && revealedChampion !== null;
  const isAlreadyCompleted = revealedChampion ? completedIds.has(revealedChampion.id) : false;

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col justify-center items-center text-[#F4EFE6] select-none">
      {/* Real 3D WebGL Dark Hextech Scene */}
      <HextechScene3D phase={phase} bgMode={bgMode} />

      {/* Moody Dark Edit Vignette + Subtle Film Grain */}
      {bgMode !== 'greenscreen' && (
        <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(3,4,6,0.8)_100%)] edit-grain opacity-60" />
      )}

      {/* Region Conquered Banner */}
      <AnimatePresence>
        {regionClearedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 border border-[#C8AA6E]/70 bg-[#050608]/95 shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <Trophy className="w-4 h-4 text-[#C8AA6E]" />
            <span className="font-lol-tech font-bold text-xs tracking-[0.25em] text-[#F4EFE6]">
              {regionClearedBanner}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-Left Minimal Region Label (only when idle, hidden during spin & reveal) */}
      {!hideHud && phase === 'idle' && (
        <div className="fixed top-5 left-6 z-40 flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setRegionModalOpen(true);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 border border-[#C8AA6E]/25 hover:border-[#C8AA6E]/70 bg-[#050608]/70 backdrop-blur-md transition-colors cursor-pointer opacity-70 hover:opacity-100"
            title="Runeterra Bölge Haritası"
          >
            <span className="font-lol-tech font-bold text-[11px] tracking-[0.22em] text-[#C8AA6E]">
              {activeRegionLabel}
            </span>
            <span className="text-[11px] font-lol-tech text-[#F4EFE6]/85">
              {primaryRegionRemaining}/{primaryRegionTotal}
            </span>
            {poolFillMode === 'min_pool' && activePool.length > primaryRegionRemaining && (
              <span className="text-[10px] font-lol-tech text-[#C8AA6E]/75">
                · HAVUZ {activePool.length}
              </span>
            )}
          </button>

          {voiceComEnabled && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050608]/75 border border-[#C8AA6E]/40 text-[11px] font-lol-tech text-[#F4EFE6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8AA6E] animate-ping" />
              <span>
                {voiceState.lastMatchedCommand
                  ? `✓ ${voiceState.lastMatchedCommand}`
                  : voiceState.lastTranscript || 'Dinliyor'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top-Right Hover-Only Corner Menu (completely invisible until hovered during Reveal!) */}
      {!hideHud && phase !== 'spinning' && (
        <div
          className={`fixed top-4 right-5 z-40 flex items-center gap-1 p-1 border border-white/10 bg-[#050608]/80 backdrop-blur-md transition-opacity duration-200 ${
            isReveal ? 'opacity-0 hover:opacity-100 focus-within:opacity-100' : 'opacity-40 hover:opacity-100'
          }`}
        >
          {isReveal && (
            <>
              {!isAlreadyCompleted && (
                <button
                  onClick={handleClaimWin}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#C8AA6E] text-[#050608] text-[11px] font-lol-tech font-bold tracking-wider uppercase cursor-pointer hover:brightness-110"
                  title="Win Aldım, havuzdan düş (W)"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Win (-1)
                </button>
              )}
              <button
                onClick={handleLoseAndReroll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-lol-tech text-[#F4EFE6]/85 hover:text-[#C8AA6E] cursor-pointer"
                title="Tekrar Çevir (Space)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tekrar
              </button>
              {skinCount > 1 && (
                <div className="inline-flex items-center gap-0.5 px-1.5 text-[11px] font-lol-tech text-[#C8AA6E]">
                  <button
                    onClick={() => setSkinIndex((i) => (i - 1 + skinCount) % skinCount)}
                    className="p-1 hover:text-white cursor-pointer"
                    title="Önceki Kostüm (Sol Ok)"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="max-w-[80px] truncate">{skinName}</span>
                  <button
                    onClick={() => setSkinIndex((i) => (i + 1) % skinCount)}
                    className="p-1 hover:text-white cursor-pointer"
                    title="Sonraki Kostüm (Sağ Ok)"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  soundEngine.stopVoice();
                  setIsVoicePlaying(false);
                  setPhase('idle');
                }}
                className="px-2 py-1.5 text-[11px] font-lol-tech text-[#C8AA6E] hover:text-white cursor-pointer"
                title="Çarka Dön (Esc)"
              >
                Çark
              </button>
              <span className="w-[1px] h-4 bg-white/15 mx-0.5" />
            </>
          )}

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setRegionModalOpen(true);
            }}
            className="p-1.5 text-[#F4EFE6]/75 hover:text-[#C8AA6E] transition-colors cursor-pointer"
            title="Bölgeler & Seri İlerlemesi"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setVoiceComEnabled((v) => !v);
            }}
            disabled={!voiceState.supported}
            className={`p-1.5 transition-colors cursor-pointer ${
              voiceComEnabled
                ? 'text-[#C8AA6E]'
                : 'text-[#F4EFE6]/75 hover:text-[#C8AA6E]'
            }`}
            title="Sesli Komut (VoiceCom) [V]"
          >
            {voiceComEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMuted((m) => !m)}
            className={`p-1.5 transition-colors cursor-pointer ${
              muted ? 'text-[#C83E4D]' : 'text-[#F4EFE6]/75 hover:text-[#C8AA6E]'
            }`}
            title={muted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setDrawerOpen(true);
            }}
            className="p-1.5 text-[#F4EFE6]/75 hover:text-[#C8AA6E] transition-colors cursor-pointer"
            title="Stüdyo Ayarları"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setHideHud(true)}
            className="p-1.5 text-[#F4EFE6]/75 hover:text-white transition-colors cursor-pointer"
            title="Arayüzü Tam Gizle [H]"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Restore HUD pill when hidden */}
      {hideHud && (
        <button
          onClick={() => setHideHud(false)}
          className="fixed top-4 right-5 z-50 p-2 bg-[#050608]/80 border border-white/15 text-[#F4EFE6] opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          title="Arayüzü Göster (H)"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* =========================
          MAIN PURE VIDEO STAGE
      ========================= */}
      <main className="relative z-20 w-full h-full flex flex-col items-center justify-center">
        {activePool.length === 0 ? (
          <div className="max-w-md mx-auto border border-[#C8AA6E]/45 bg-[#050608]/95 p-7 text-center space-y-4 backdrop-blur-md">
            <Trophy className="w-9 h-9 text-[#C8AA6E] mx-auto" />
            <h2 className="font-lol-display font-bold text-3xl gold-editorial-text">
              Bu Bölgede Şampiyon Kalmadı
            </h2>
            <p className="text-xs text-[#F4EFE6]/70">
              {activeRegionLabel} bölgesindeki tüm şampiyonlarla win aldın veya havuz filtrelendi.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setRegionModalOpen(true)}
                className="px-5 py-2 bg-[#C8AA6E] text-[#050608] font-lol-tech font-bold text-xs tracking-wider uppercase cursor-pointer"
              >
                Yeni Bölge Seç
              </button>
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 border border-white/15 text-xs font-lol-tech text-[#F4EFE6] cursor-pointer"
              >
                Sıfırla
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {phase === 'revealed' && revealedChampion ? (
              <ChampionReveal
                key={`reveal-${revealedChampion.id}`}
                champion={revealedChampion}
                rolledLane={lockedLane}
                skinIndex={skinIndex}
                onSkinsLoaded={handleSkinsLoaded}
                bgMode={bgMode}
                isVoicePlaying={isVoicePlaying}
                challenge={activeChallenge}
                onRerollChallenge={rollChallenge}
              />
            ) : (
              <motion.div
                key="wheel-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full flex flex-col items-center justify-center"
              >
                {/* Minimal Broadcast Role Strip */}
                {randomRoleEnabled && (
                  <RoleBadgeBar
                    enabledRoles={enabledRoles}
                    highlightedLane={highlightedLane}
                    lockedLane={lockedLane}
                    isRollingRole={isRollingRole}
                    isSpinning={phase === 'spinning'}
                    onToggleRole={handleToggleRole}
                  />
                )}

                <SpinStage
                  pool={activePool}
                  allChampions={CHAMPIONS}
                  spinTrigger={spinTrigger}
                  targetChampion={targetChampion}
                  isSpinning={phase === 'spinning'}
                  spinMode={spinMode}
                  spinSpeed={spinSpeed}
                  onSpinComplete={handleSpinComplete}
                />

                {/* Minimal Editorial Spin Trigger */}
                <motion.div
                  animate={{
                    opacity: phase === 'spinning' ? 0 : hideHud ? 0 : 1,
                    y: phase === 'spinning' ? 10 : 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className="mt-5 pointer-events-auto"
                >
                  <button
                    onClick={startSpin}
                    disabled={phase === 'spinning'}
                    className="hex-chamfer px-12 py-3 bg-[#0B0E14]/90 hover:bg-[#C8AA6E] border border-[#C8AA6E]/70 text-[#F4EFE6] hover:text-[#050608] font-lol-tech font-bold text-sm tracking-[0.3em] uppercase shadow-[0_10px_35px_rgba(0,0,0,0.85)] transition-all cursor-pointer active:scale-95"
                  >
                    ÇEVİR
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* =========================
          SLIDE-OVER STUDIO DRAWER
      ========================= */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full bg-[#07090E]/95 border-l border-[#C8AA6E]/30 p-5 overflow-y-auto space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-lol-display font-bold text-xl text-[#F4EFE6]">
                    Stüdyo Ayarları
                  </h2>
                  <p className="text-[11px] text-[#C8AA6E]/80">
                    Kısayollar: Space (Çevir) · W (Win) · R (Replik) · H (Gizle)
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 border border-white/15 hover:border-[#C8AA6E] text-[#F4EFE6] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions for Revealed Champion */}
              {isReveal && revealedChampion && (
                <div className="border border-[#C8AA6E]/40 bg-[#050608] p-3.5 space-y-2.5">
                  <div className="text-[11px] font-lol-tech font-bold text-[#C8AA6E] uppercase tracking-wider">
                    Seçili: {revealedChampion.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {!isAlreadyCompleted && (
                      <button
                        onClick={() => {
                          setDrawerOpen(false);
                          handleClaimWin();
                        }}
                        className="py-2 bg-[#C8AA6E] text-[#050608] text-xs font-lol-tech font-bold uppercase cursor-pointer"
                      >
                        Win Aldım (W)
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        handleLoseAndReroll();
                      }}
                      className="py-2 border border-white/20 text-xs font-lol-tech text-[#F4EFE6] uppercase cursor-pointer"
                    >
                      Tekrar Çevir
                    </button>
                    <button
                      onClick={() => playChampionPickVoice(revealedChampion)}
                      className="py-1.5 border border-white/15 text-[11px] font-lol-tech text-[#F4EFE6]/85 cursor-pointer"
                    >
                      Seçim Repliği (R)
                    </button>
                    <button
                      onClick={() => playChampionBanVoice(revealedChampion)}
                      className="py-1.5 border border-white/15 text-[11px] font-lol-tech text-[#F4EFE6]/85 cursor-pointer"
                    >
                      Ban Repliği
                    </button>
                  </div>
                </div>
              )}

              {/* Region Progression Card */}
              <div className="border border-white/10 bg-[#050608]/80 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-lol-tech font-bold text-[#C8AA6E]">
                    BÖLGE: {activeRegionLabel}
                  </span>
                  <span className="text-xs font-lol-tech text-[#F4EFE6]">
                    {winsCount}W / {lossesCount}L
                  </span>
                </div>
                <div className="text-[11px] text-[#F4EFE6]/70">
                  Bölgede kalan: <strong className="text-[#F4EFE6]">{primaryRegionRemaining}/{primaryRegionTotal}</strong> · Havuz:{' '}
                  <strong className="text-[#C8AA6E]">{activePool.length}</strong>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setRegionModalOpen(true);
                  }}
                  className="w-full py-2 bg-[#C8AA6E]/15 hover:bg-[#C8AA6E]/25 border border-[#C8AA6E]/50 text-xs font-lol-tech font-bold text-[#C8AA6E] cursor-pointer"
                >
                  Bölge Haritası & 20–25 Havuz Modu
                </button>
              </div>

              {/* Role Settings */}
              <div className="space-y-2 border border-white/10 bg-[#050608]/75 p-3">
                <label className="flex items-center justify-between text-xs font-lol-tech cursor-pointer">
                  <span className="flex items-center gap-2 text-[#C8AA6E] font-bold">
                    <Dices className="w-3.5 h-3.5" />
                    Rastgele Rol Seçimi
                  </span>
                  <input
                    type="checkbox"
                    checked={randomRoleEnabled}
                    onChange={(e) => setRandomRoleEnabled(e.target.checked)}
                    className="accent-[#C8AA6E]"
                  />
                </label>
                {randomRoleEnabled && (
                  <label className="flex items-center justify-between text-[11px] pt-1 text-[#F4EFE6]/75 cursor-pointer">
                    <span>Çıkan şampiyon role uygun olsun</span>
                    <input
                      type="checkbox"
                      checked={filterChampByRolledRole}
                      onChange={(e) => setFilterChampByRolledRole(e.target.checked)}
                      className="accent-[#C8AA6E]"
                    />
                  </label>
                )}
              </div>

              {/* Class Filter */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-lol-tech uppercase tracking-widest text-[#C8AA6E]">
                  Sınıf Filtresi
                </div>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value as ChampionTag | 'all')}
                  className="w-full px-3 py-2 bg-[#050608] border border-white/15 text-xs font-lol-tech text-[#F4EFE6] outline-none"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {ALL_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {TAG_LABELS_TR[tag]}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3D Animation Mode & Speed */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-lol-tech uppercase tracking-widest text-[#C8AA6E]">
                  3D Çark Animasyonu
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSpinMode('carousel3d')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-lol-tech font-bold border cursor-pointer ${
                      spinMode === 'carousel3d'
                        ? 'bg-[#C8AA6E] text-[#050608] border-[#C8AA6E]'
                        : 'bg-[#050608] text-[#F4EFE6]/80 border-white/10'
                    }`}
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    3D Çark
                  </button>
                  <button
                    onClick={() => setSpinMode('strip3d')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-lol-tech font-bold border cursor-pointer ${
                      spinMode === 'strip3d'
                        ? 'bg-[#C8AA6E] text-[#050608] border-[#C8AA6E]'
                        : 'bg-[#050608] text-[#F4EFE6]/80 border-white/10'
                    }`}
                  >
                    <GalleryHorizontalEnd className="w-3.5 h-3.5" />
                    3D Şerit
                  </button>
                </div>

                <select
                  value={spinSpeed}
                  onChange={(e) => setSpinSpeed(e.target.value as SpinSpeed)}
                  className="w-full px-3 py-2 bg-[#050608] border border-white/15 text-xs font-lol-tech text-[#F4EFE6] outline-none"
                >
                  <option value="fast">Süre: Hızlı (2.4s)</option>
                  <option value="normal">Süre: Normal (4.2s)</option>
                  <option value="dramatic">Süre: Dramatik (6s)</option>
                </select>
              </div>

              {/* Theme & Background Mode */}
              <div className="space-y-2">
                <div className="text-[11px] font-lol-tech uppercase tracking-widest text-[#C8AA6E]">
                  Arka Plan Teması
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'hextech', label: '3D Edit' },
                    { id: 'void', label: 'Karanlık' },
                    { id: 'greenscreen', label: 'Yeşil Ekran' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBgMode(b.id as BgMode)}
                      className={`py-2 text-[11px] font-lol-tech font-bold border cursor-pointer flex items-center justify-center gap-1 ${
                        bgMode === b.id
                          ? 'bg-[#C8AA6E] text-[#050608] border-[#C8AA6E]'
                          : 'bg-[#050608] text-[#F4EFE6]/80 border-white/10'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio & Replik Language */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-lol-tech uppercase tracking-widest text-[#C8AA6E]">
                  <span>Ses & Replik Dili</span>
                  <button
                    onClick={() => setVoiceLang((l) => (l === 'tr_tr' ? 'default' : 'tr_tr'))}
                    className="px-2 py-0.5 bg-[#050608] border border-[#C8AA6E]/40 text-[#F4EFE6] cursor-pointer"
                  >
                    {voiceLang === 'tr_tr' ? 'Türkçe (TR)' : 'İngilizce (EN)'}
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (val > 0 && muted) setMuted(false);
                  }}
                  className="w-full accent-[#C8AA6E] cursor-pointer"
                />
              </div>

              {/* VoiceCom Options */}
              <div className="space-y-2 border border-white/10 bg-[#050608]/75 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-lol-tech font-bold text-[#C8AA6E]">
                    VoiceCom (Sesli Komut)
                  </span>
                  <input
                    type="checkbox"
                    checked={voiceComEnabled}
                    onChange={(e) => setVoiceComEnabled(e.target.checked)}
                    className="accent-[#C8AA6E]"
                  />
                </div>
                <p className="text-[11px] text-[#F4EFE6]/65 leading-relaxed">
                  Komutlar: “Çevir”, “Win aldım”, “Replik”, “Mid”, “Orman”, “Üst”, “Nişancı”, “Destek”.
                </p>
                <label className="flex items-center justify-between text-xs pt-1 cursor-pointer">
                  <span className="text-[#F4EFE6]/85">Tetik Kelime Kullan</span>
                  <input
                    type="checkbox"
                    checked={wakeWordEnabled}
                    onChange={(e) => setWakeWordEnabled(e.target.checked)}
                    className="accent-[#C8AA6E]"
                  />
                </label>
                {wakeWordEnabled && (
                  <input
                    type="text"
                    value={wakeWord}
                    onChange={(e) => setWakeWord(e.target.value)}
                    placeholder="Örn: hextech"
                    className="w-full px-2.5 py-1.5 bg-[#07090E] border border-white/15 text-xs text-[#F4EFE6] outline-none"
                  />
                )}
              </div>

              {/* Extra Toggles & Pool */}
              <div className="space-y-2">
                <button
                  onClick={() => setChallengeMode((c) => !c)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border text-xs font-lol-tech cursor-pointer ${
                    challengeMode
                      ? 'border-[#C83E4D] bg-[#C83E4D]/15 text-[#F4EFE6]'
                      : 'border-white/10 bg-[#050608] text-[#F4EFE6]/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#C83E4D]" />
                    Challenge Görevi Ekle
                  </span>
                  <span>{challengeMode ? 'AÇIK' : 'KAPALI'}</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setPoolModalOpen(true);
                  }}
                  className="w-full py-2.5 border border-white/15 bg-[#050608] hover:border-[#C8AA6E] text-xs font-lol-tech font-bold text-[#C8AA6E] cursor-pointer"
                >
                  Manuel Şampiyon Yasakla ({excludedIds.size} gizli)
                </button>
              </div>

              {/* Roll History Inside Drawer */}
              {history.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-lol-tech uppercase tracking-widest text-[#C8AA6E]">
                      Son Çıkanlar
                    </span>
                    <button
                      onClick={() => setHistory([])}
                      className="text-[#F4EFE6]/50 hover:text-[#C83E4D] cursor-pointer"
                      title="Temizle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setDrawerOpen(false);
                          setRevealedChampion(c);
                          setSkinIndex(0);
                          setPhase('revealed');
                          playChampionPickVoice(c);
                        }}
                        className="inline-flex items-center gap-1.5 pr-2.5 pl-1 py-1 bg-[#050608] border border-white/15 hover:border-[#C8AA6E] text-xs cursor-pointer"
                      >
                        <img
                          src={getChampionIconUrl(c.id)}
                          alt={c.name}
                          className="w-5 h-5 object-cover"
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Runeterra Region Progression Map Modal */}
      <RegionMapModal
        open={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        activeRegions={activeRegions}
        multiSelect={multiSelectRegions}
        poolFillMode={poolFillMode}
        targetPoolSize={targetPoolSize}
        completedIds={completedIds}
        winsCount={winsCount}
        lossesCount={lossesCount}
        onSelectRegion={handleSelectRegion}
        onToggleMultiSelect={() => {
          soundEngine.playUiClick();
          setMultiSelectRegions((m) => !m);
        }}
        onSetPoolFillMode={(m) => {
          soundEngine.playUiClick();
          setPoolFillMode(m);
        }}
        onSetTargetPoolSize={(s) => setTargetPoolSize(s)}
        onSelectAllRegions={() => {
          soundEngine.playUiClick();
          setMultiSelectRegions(true);
          setActiveRegions(REGIONS.map((r) => r.id));
        }}
        onResetProgress={handleResetProgress}
      />

      {/* Champion Manual Ban Modal */}
      <PoolManagerModal
        open={poolModalOpen}
        onClose={() => setPoolModalOpen(false)}
        champions={CHAMPIONS}
        excludedIds={excludedIds}
        onToggleExclude={handleToggleExclude}
        onIncludeAll={() => {
          soundEngine.playUiClick();
          setExcludedIds(new Set());
        }}
        onExcludeAll={() => {
          soundEngine.playUiClick();
          setExcludedIds(new Set(CHAMPIONS.map((c) => c.id)));
        }}
      />
    </div>
  );
}
