import { motion } from 'framer-motion';
import { LANE_META } from '../data/champions';
import type { Lane } from '../data/champions';

export function LaneIcon({ lane, className = 'w-4 h-4' }: { lane: Lane; className?: string }) {
  switch (lane) {
    case 'top':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3 3h13l-3 3H6v7l-3 3V3zm18 18H8l3-3h7v-7l3-3v13z" opacity="0.35" />
          <path d="M3 3h13l-3 3H6v7l-3 3V3z" />
        </svg>
      );
    case 'jungle':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 2c-1.5 3.5-4 5.8-4 9 0 2.2 1.2 4 3 5v6h2v-6c1.8-1 3-2.8 3-5 0-3.2-2.5-5.5-4-9zm-6.5 7.5C4.5 11.2 4 12.8 4 14.5c0 2 1.2 3.5 3 4.2-.6-1.1-.8-2.4-.5-3.8.3-1.8 1.2-3.4 2.2-4.7-1.1-.1-2.2-.3-3.2-.7zm13 0c-1 .4-2.1.6-3.2.7 1 1.3 1.9 2.9 2.2 4.7.3 1.4.1 2.7-.5 3.8 1.8-.7 3-2.2 3-4.2 0-1.7-.5-3.3-1.5-5z" />
        </svg>
      );
    case 'mid':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3 3h7L3 10V3zm18 18h-7l7-7v7z" opacity="0.35" />
          <path d="M18.5 3L3 18.5V21h2.5L21 5.5V3h-2.5z" />
        </svg>
      );
    case 'adc':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3 3h13l-3 3H6v7l-3 3V3z" opacity="0.35" />
          <path d="M21 21H8l3-3h7v-7l3-3v13z" />
        </svg>
      );
    case 'support':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 3l3 4 5-1-2.5 5L12 20l-5.5-9L4 6l5 1 3-4z" />
        </svg>
      );
  }
}

interface RoleBadgeBarProps {
  enabledRoles: Set<Lane>;
  highlightedLane: Lane | null;
  lockedLane: Lane | null;
  isRollingRole: boolean;
  isSpinning: boolean;
  onToggleRole: (lane: Lane) => void;
}

const LANES: Lane[] = ['top', 'jungle', 'mid', 'adc', 'support'];

export default function RoleBadgeBar({
  enabledRoles,
  highlightedLane,
  lockedLane,
  isRollingRole,
  isSpinning,
  onToggleRole,
}: RoleBadgeBarProps) {
  return (
    <div className="relative z-30 inline-flex items-center justify-center border-y border-[#C8AA6E]/20 bg-[#050608]/70 backdrop-blur-md px-2 py-1 mb-4">
      {LANES.map((lane, idx) => {
        const meta = LANE_META[lane];
        const isEnabled = enabledRoles.has(lane);
        const isLocked = lockedLane === lane;
        const isLit = highlightedLane === lane;

        return (
          <div key={lane} className="flex items-center">
            <motion.button
              type="button"
              disabled={isSpinning}
              onClick={() => onToggleRole(lane)}
              animate={
                isLocked
                  ? { scale: [1, 1.1, 1.03] }
                  : isLit
                  ? { scale: 1.05 }
                  : { scale: 1 }
              }
              transition={{ duration: 0.14 }}
              className={`relative flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 text-[11px] font-lol-tech font-bold tracking-[0.22em] uppercase transition-all cursor-pointer ${
                isLocked
                  ? 'bg-[#C8AA6E]/20 text-[#F4EFE6] shadow-[inset_0_-2px_0_#C8AA6E]'
                  : isLit && isRollingRole
                  ? 'bg-white/10 text-[#F4EFE6]'
                  : isEnabled
                  ? 'text-[#C8AA6E]/75 hover:text-[#F4EFE6]'
                  : 'text-white/20 opacity-40'
              }`}
              title={`${meta.label} — Rol havuzuna ekle/çıkar`}
            >
              <LaneIcon lane={lane} className="w-3.5 h-3.5" />
              <span>{meta.short}</span>
            </motion.button>
            {idx < LANES.length - 1 && (
              <span className="w-[1px] h-3.5 bg-[#C8AA6E]/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}
