import { useEffect, useMemo, useRef, useState } from 'react';
import { getChampionPortraitUrl, TAG_LABELS_TR } from '../data/champions';
import type { Champion } from '../data/champions';
import { soundEngine } from '../utils/soundEngine';

export type SpinMode = 'carousel3d' | 'strip3d';
export type SpinSpeed = 'fast' | 'normal' | 'dramatic';

interface SpinStageProps {
  pool: Champion[];
  allChampions: Champion[];
  spinTrigger: number;
  targetChampion: Champion | null;
  isSpinning: boolean;
  spinMode: SpinMode;
  spinSpeed: SpinSpeed;
  onSpinComplete: (champion: Champion) => void;
}

const SPEED_MS: Record<SpinSpeed, number> = {
  fast: 2400,
  normal: 4200,
  dramatic: 6000,
};

const RING_SIZE = 12;
const RING_STEP = 360 / RING_SIZE; // 30 deg
const STRIP_LEN = 66;
const WIN_INDEX = 56;
const CARD_PITCH = 228; // px

function allFallback(): Champion {
  return {
    id: 'Yasuo',
    key: '157',
    name: 'Yasuo',
    title: 'Günahkâr Kılıç',
    blurb: '',
    tags: ['Fighter', 'Assassin'],
    partype: 'Akış',
    info: { attack: 8, defense: 4, magic: 4, difficulty: 10 },
    lanes: ['mid', 'top'],
    region: 'ionia',
    quote: 'Ölüm de rüzgâr gibi; hep yanı başımda.',
    version: '16.23.1',
  };
}

function pickRandomFrom(list: Champion[], excludeId?: string): Champion {
  if (list.length === 0) return allFallback();
  if (list.length === 1) return list[0];
  let pick = list[Math.floor(Math.random() * list.length)];
  if (excludeId && pick.id === excludeId) {
    pick = list[(list.indexOf(pick) + 1) % list.length];
  }
  return pick;
}

export default function SpinStage({
  pool,
  allChampions,
  spinTrigger,
  targetChampion,
  isSpinning,
  spinMode,
  spinSpeed,
  onSpinComplete,
}: SpinStageProps) {
  const sourceList = useMemo(() => {
    if (pool.length >= 6) return pool;
    const inPoolIds = new Set(pool.map((c) => c.id));
    const fillers = allChampions.filter((c) => !inPoolIds.has(c.id)).slice(0, 20);
    return [...pool, ...fillers];
  }, [pool, allChampions]);

  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);
  const spinParamsRef = useRef({
    sourceList,
    targetChampion,
    isSpinning,
    spinMode,
    spinSpeed,
    onSpinComplete,
  });

  useEffect(() => {
    spinParamsRef.current = {
      sourceList,
      targetChampion,
      isSpinning,
      spinMode,
      spinSpeed,
      onSpinComplete,
    };
  }, [sourceList, targetChampion, isSpinning, spinMode, spinSpeed, onSpinComplete]);

  // Idle derived champion lists (auto-updates immediately when filters change, no modulo collision!)
  const idleSlotChampions = useMemo(
    () =>
      Array.from(
        { length: RING_SIZE },
        (_, i) => sourceList[i % sourceList.length] || sourceList[0]
      ),
    [sourceList]
  );

  const idleStripTrack = useMemo(
    () =>
      Array.from(
        { length: STRIP_LEN },
        (_, i) => sourceList[i % sourceList.length] || sourceList[0]
      ),
    [sourceList]
  );

  // Active spin state
  const [ringStepFloat, setRingStepFloat] = useState(0);
  const ringStepFloatRef = useRef(0);
  const [spinSlotChampions, setSpinSlotChampions] = useState<Champion[] | null>(null);
  const [needleFlash, setNeedleFlash] = useState(0);

  const [spinStripTrack, setSpinStripTrack] = useState<Champion[] | null>(null);
  const [stripOffset, setStripOffset] = useState(4 * CARD_PITCH);
  const [stripVelocity, setStripVelocity] = useState(0);

  const displayedSlots = isSpinning && spinSlotChampions ? spinSlotChampions : idleSlotChampions;
  const displayedStrip = isSpinning && spinStripTrack ? spinStripTrack : idleStripTrack;
  const displayedStripOffset = isSpinning ? stripOffset : 4 * CARD_PITCH;

  // Idle gentle 3D rotation when not spinning
  useEffect(() => {
    if (isSpinning || spinMode !== 'carousel3d') return;
    let last = performance.now();
    let id = 0;

    const tickIdle = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ringStepFloatRef.current += dt * 0.42;
      setRingStepFloat(ringStepFloatRef.current);
      id = requestAnimationFrame(tickIdle);
    };

    id = requestAnimationFrame(tickIdle);
    return () => cancelAnimationFrame(id);
  }, [isSpinning, spinMode]);

  // Active Spin Driver
  useEffect(() => {
    if (spinTrigger === 0) return;
    const params = spinParamsRef.current;
    if (!params.isSpinning || !params.targetChampion) return;

    const winner = params.targetChampion;
    const activeList = params.sourceList;
    const duration = SPEED_MS[params.spinSpeed];
    const mode = params.spinMode;

    completedRef.current = false;
    cancelAnimationFrame(rafRef.current);

    const startTime = performance.now();

    if (mode === 'carousel3d') {
      const startStep = Math.round(ringStepFloatRef.current);
      const totalSteps = 36 + Math.floor(Math.random() * 6); // 3+ full 3D revolutions
      const endStep = startStep + totalSteps;
      const halfRing = RING_SIZE / 2; // 6

      const deck: Champion[] = [];
      for (let d = 0; d <= totalSteps + halfRing; d++) {
        if (d === totalSteps) {
          deck.push(winner);
        } else {
          const prevChamp = d > 0 ? deck[d - 1] : undefined;
          deck.push(pickRandomFrom(activeList, prevChamp?.id));
        }
      }

      const initialSlots = Array.from({ length: RING_SIZE }, (_, idx) => {
        const offset = ((idx - (startStep % RING_SIZE)) + RING_SIZE) % RING_SIZE;
        const signed = offset > halfRing ? offset - RING_SIZE : offset;
        if (signed >= 0 && signed < halfRing) {
          return deck[signed];
        }
        return pickRandomFrom(activeList);
      });

      let initializedSlots = false;
      let lastTickStep = startStep;
      let highestReplaced = halfRing - 1;

      const animateCarousel = (now: number) => {
        if (!initializedSlots) {
          initializedSlots = true;
          setSpinSlotChampions(initialSlots);
        }

        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - t, 4.3);
        const current = startStep + totalSteps * ease;

        ringStepFloatRef.current = current;
        setRingStepFloat(current);

        const currentTick = Math.floor(current + 0.5);
        if (currentTick > lastTickStep) {
          lastTickStep = currentTick;
          soundEngine.playTick(t);
          setNeedleFlash((n) => n + 1);

          const passedSteps = currentTick - startStep;
          const backNeeded = passedSteps + halfRing;
          if (backNeeded > highestReplaced && backNeeded <= totalSteps + halfRing) {
            const from = highestReplaced + 1;
            const to = backNeeded;
            highestReplaced = backNeeded;
            setSpinSlotChampions((prev) => {
              const next = [...(prev || initialSlots)];
              for (let s = from; s <= to; s++) {
                const slotIdx = (startStep + s) % RING_SIZE;
                next[slotIdx] = deck[s] || pickRandomFrom(activeList);
              }
              return next;
            });
          }
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animateCarousel);
        } else if (!completedRef.current) {
          completedRef.current = true;
          ringStepFloatRef.current = endStep;
          setRingStepFloat(endStep);
          setTimeout(() => spinParamsRef.current.onSpinComplete(winner), 260);
        }
      };

      rafRef.current = requestAnimationFrame(animateCarousel);
    } else {
      const track: Champion[] = [];
      for (let i = 0; i < STRIP_LEN; i++) {
        if (i === WIN_INDEX) {
          track.push(winner);
        } else {
          const prevChamp = i > 0 ? track[i - 1] : undefined;
          track.push(pickRandomFrom(activeList, prevChamp?.id));
        }
      }

      const startX = 2 * CARD_PITCH;
      const endJitter = (Math.random() - 0.5) * 34;
      const endX = WIN_INDEX * CARD_PITCH + endJitter;
      let lastTickIndex = Math.floor(startX / CARD_PITCH);
      let prevX = startX;
      let initializedTrack = false;

      const animateStrip = (now: number) => {
        if (!initializedTrack) {
          initializedTrack = true;
          setSpinStripTrack(track);
        }

        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - t, 4.4);
        const currentX = startX + (endX - startX) * ease;
        const vel = Math.abs(currentX - prevX);
        prevX = currentX;

        setStripOffset(currentX);
        setStripVelocity(vel);

        const idx = Math.floor((currentX + CARD_PITCH * 0.5) / CARD_PITCH);
        if (idx > lastTickIndex) {
          lastTickIndex = idx;
          soundEngine.playTick(t);
          setNeedleFlash((n) => n + 1);
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animateStrip);
        } else if (!completedRef.current) {
          completedRef.current = true;
          setStripVelocity(0);
          setStripOffset(WIN_INDEX * CARD_PITCH);
          setTimeout(() => spinParamsRef.current.onSpinComplete(winner), 280);
        }
      };

      rafRef.current = requestAnimationFrame(animateStrip);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [spinTrigger]);

  const carouselRadius = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 350;
    return 520;
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none">
      {/* Architectural Broadcast Center Reticle (Top) */}
      <div className="relative z-30 flex flex-col items-center mb-1 pointer-events-none">
        <div
          key={needleFlash}
          className={`w-2.5 h-2.5 rotate-45 border transition-transform duration-75 ${
            isSpinning
              ? 'bg-[#E2CFA3] border-[#F4EFE6] scale-110'
              : 'bg-[#C8AA6E]/80 border-[#C8AA6E]'
          }`}
        />
        <div className="w-[1px] h-5 bg-gradient-to-b from-[#C8AA6E] to-transparent" />
      </div>

      {spinMode === 'carousel3d' ? (
        /* =========================
           3D CYLINDRICAL CAROUSEL
        ========================= */
        <div className="relative w-full h-[420px] sm:h-[470px] stage-3d flex items-center justify-center overflow-x-clip overflow-y-visible">
          {/* Subtle floor shadow */}
          <div
            className="absolute bottom-2 w-[580px] max-w-[90vw] h-24 rounded-[100%] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(200,170,110,0.12) 0%, rgba(0,0,0,0.5) 55%, transparent 75%)',
              transform: 'rotateX(75deg)',
            }}
          />

          {/* Matte Gold Hairline Center Bracket */}
          <div className="absolute inset-y-3 w-[236px] sm:w-[266px] pointer-events-none z-20 flex flex-col justify-between items-center">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C8AA6E]/70 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C8AA6E]/70 to-transparent" />
          </div>

          <div className="relative w-full h-full flex items-center justify-center preserve-3d">
            {displayedSlots.map((champ, slotIndex) => {
              const rawAngle = (slotIndex - ringStepFloat) * RING_STEP;
              const relAngle = (((rawAngle % 360) + 540) % 360) - 180;
              const absAngle = Math.abs(relAngle);
              const isFrontHalf = absAngle < 96;

              if (!isFrontHalf) return null;

              const closeness = Math.max(0, 1 - absAngle / 96);
              const isCenter = absAngle < 15;
              const opacity = Math.pow(closeness, 0.55);
              const brightness = 0.42 + Math.pow(closeness, 1.4) * 0.62;

              return (
                <div
                  key={`slot-${slotIndex}`}
                  className="absolute preserve-3d backface-hidden"
                  style={{
                    transform: `rotateY(${relAngle}deg) translateZ(${carouselRadius}px) scale(${
                      0.82 + closeness * 0.18
                    })`,
                    opacity,
                    zIndex: Math.round(closeness * 100),
                  }}
                >
                  <div
                    className={`relative w-[166px] sm:w-[184px] h-[268px] sm:h-[296px] rounded-md overflow-hidden transition-colors duration-150 ${
                      isCenter
                        ? 'border border-[#C8AA6E] shadow-[0_24px_65px_rgba(0,0,0,0.95)]'
                        : 'border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.9)]'
                    }`}
                    style={{
                      backgroundColor: '#050608',
                      filter: `brightness(${brightness.toFixed(2)}) saturate(${(
                        0.72 +
                        closeness * 0.35
                      ).toFixed(2)})`,
                    }}
                  >
                    <img
                      src={getChampionPortraitUrl(champ.id)}
                      alt={champ.name}
                      loading="eager"
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/20 to-transparent" />

                    <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                      <span className="inline-block text-[9px] font-lol-tech tracking-[0.26em] uppercase text-[#C8AA6E]/80 mb-0.5">
                        {TAG_LABELS_TR[champ.tags[0]] || champ.tags[0]}
                      </span>
                      <div className="font-lol-display font-bold text-xl sm:text-2xl leading-tight text-[#F4EFE6] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                        {champ.name}
                      </div>
                      <div className="text-[11px] font-lol-display italic text-[#C8AA6E]/85 truncate">
                        {champ.title}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =========================
           3D TILTED DRAFT STRIP
        ========================= */
        <div className="relative w-full max-w-6xl h-[390px] sm:h-[430px] stage-3d flex items-center justify-center overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-28 sm:w-56 bg-gradient-to-r from-[#050608] via-[#050608]/85 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-28 sm:w-56 bg-gradient-to-l from-[#050608] via-[#050608]/85 to-transparent z-20 pointer-events-none" />

          <div
            className={`absolute inset-y-4 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-[#C8AA6E] via-[#F4EFE6]/70 to-[#C8AA6E] z-30 pointer-events-none transition-opacity duration-300 ${
              isSpinning ? 'opacity-80' : 'opacity-20'
            }`}
          />

          <div
            className="relative w-full h-full flex items-center preserve-3d"
            style={{
              transform: 'rotateX(5deg)',
            }}
          >
            {displayedStrip.map((champ, idx) => {
              const dist = idx * CARD_PITCH - displayedStripOffset;
              if (Math.abs(dist) > 960) return null;

              const norm = Math.max(-1, Math.min(1, dist / 600));
              const closeness = Math.max(0, 1 - Math.abs(norm));
              const isCentered = Math.abs(dist) < CARD_PITCH * 0.45;
              const blurPx = isSpinning ? Math.min(3, stripVelocity * 0.045) : 0;
              const brightness = 0.45 + Math.pow(closeness, 1.3) * 0.6;

              return (
                <div
                  key={`strip-${idx}`}
                  className="absolute left-1/2 top-1/2 preserve-3d"
                  style={{
                    transform: `translate3d(${dist - 102}px, -50%, ${
                      closeness * 80
                    }px) rotateY(${-norm * 22}deg) scale(${1.04 - Math.abs(norm) * 0.2})`,
                    filter: blurPx > 0.6 ? `blur(${blurPx.toFixed(1)}px)` : 'none',
                    zIndex: isCentered ? 25 : Math.round(closeness * 20),
                  }}
                >
                  <div
                    className={`w-[204px] h-[328px] rounded-md overflow-hidden bg-[#050608] relative ${
                      isCentered
                        ? 'border border-[#C8AA6E] shadow-[0_24px_65px_rgba(0,0,0,0.95)]'
                        : 'border border-white/10 shadow-2xl'
                    }`}
                    style={{
                      filter: `brightness(${brightness.toFixed(2)}) saturate(${(
                        0.72 +
                        closeness * 0.35
                      ).toFixed(2)})`,
                    }}
                  >
                    <img
                      src={getChampionPortraitUrl(champ.id)}
                      alt={champ.name}
                      loading="eager"
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                      <span className="text-[9px] font-lol-tech tracking-[0.26em] uppercase text-[#C8AA6E]/80">
                        {TAG_LABELS_TR[champ.tags[0]] || champ.tags[0]}
                      </span>
                      <div className="font-lol-display font-bold text-xl text-[#F4EFE6] truncate">
                        {champ.name}
                      </div>
                      <div className="text-[11px] font-lol-display italic text-[#C8AA6E]/85 truncate">
                        {champ.title}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
