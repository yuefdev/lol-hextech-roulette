import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChampionTag, Lane } from '../data/champions';

export interface VoiceCommandActions {
  onSpin: () => void;
  onClaimWin?: () => void;
  onPlayPickVo: () => void;
  onPlayBanVo: () => void;
  onSetLane: (lane: Lane | 'all') => void;
  onSetTag: (tag: ChampionTag | 'all') => void;
  onToggleCinemaMode: (value?: boolean) => void;
}

interface UseVoiceCommandsOptions {
  enabled: boolean;
  wakeWordEnabled: boolean;
  wakeWord: string;
  actions: VoiceCommandActions;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [subIndex: number]: { transcript: string };
    };
  };
}

function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function useVoiceCommands({
  enabled,
  wakeWordEnabled,
  wakeWord,
  actions,
}: UseVoiceCommandsOptions) {
  const [supported] = useState(() => {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  });
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastMatchedCommand, setLastMatchedCommand] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actionsRef = useRef(actions);
  const wakeRef = useRef({ wakeWordEnabled, wakeWord });
  const enabledRef = useRef(enabled);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const cooldownRef = useRef<Record<string, number>>({});

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    wakeRef.current = { wakeWordEnabled, wakeWord };
  }, [wakeWordEnabled, wakeWord]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const canTrigger = useCallback((cmdKey: string, ms = 1800) => {
    const now = Date.now();
    if (now - (cooldownRef.current[cmdKey] || 0) < ms) {
      return false;
    }
    cooldownRef.current[cmdKey] = now;
    return true;
  }, []);

  const processTranscript = useCallback(
    (rawText: string, isFinal: boolean) => {
      const normalized = normalizeTr(rawText);
      if (!normalized) return;

      setLastTranscript(rawText.trim());

      const { wakeWordEnabled: needWake, wakeWord: rawWake } = wakeRef.current;
      const cleanWake = normalizeTr(rawWake || 'hextech');

      let commandText = normalized;
      if (needWake) {
        const wakeIdx = normalized.indexOf(cleanWake);
        if (wakeIdx === -1) return;
        commandText = normalized.slice(wakeIdx + cleanWake.length).trim();
      }

      const fire = (label: string, key: string, fn: () => void) => {
        if (!canTrigger(key)) return;
        setLastMatchedCommand(label);
        fn();
      };

      // Spin commands (can fire quickly even on interim for snappy feel!)
      if (
        /\b(cevir|dondur|sec|rastgele|baslat|spin|roll|sampiyon sec|car sec|tekrar|bir daha|degistir|ac)\b/.test(
          commandText
        )
      ) {
        fire('Çarkı Çevir', 'spin', () => actionsRef.current.onSpin());
        return;
      }

      if (!isFinal) return;

      // Win claim command
      if (/\b(win aldim|kazandim|kazandik|win)\b/.test(commandText)) {
        fire('Win Alındı (-1)', 'win', () => actionsRef.current.onClaimWin?.());
        return;
      }

      // Voice line commands
      if (/\b(ban repligi|ban sesi|yasakla|banla)\b/.test(commandText)) {
        fire('Ban Repliği', 'banvo', () => actionsRef.current.onPlayBanVo());
        return;
      }
      if (/\b(replik|konus|seslendir|sesi ac|soyle)\b/.test(commandText)) {
        fire('Seçim Repliği', 'pickvo', () => actionsRef.current.onPlayPickVo());
        return;
      }

      // Lane filters
      if (/\b(ust koridor|ust|top|solo)\b/.test(commandText)) {
        fire('Filtre: Üst Koridor', 'lane', () => actionsRef.current.onSetLane('top'));
        return;
      }
      if (/\b(orman|ormanci|jungle|jung)\b/.test(commandText)) {
        fire('Filtre: Orman', 'lane', () => actionsRef.current.onSetLane('jungle'));
        return;
      }
      if (/\b(orta koridor|orta|mid)\b/.test(commandText)) {
        fire('Filtre: Orta Koridor', 'lane', () => actionsRef.current.onSetLane('mid'));
        return;
      }
      if (/\b(alt koridor|nisanci|adc|bot)\b/.test(commandText)) {
        fire('Filtre: Nişancı (ADC)', 'lane', () => actionsRef.current.onSetLane('adc'));
        return;
      }
      if (/\b(destek|support|sup)\b/.test(commandText)) {
        fire('Filtre: Destek', 'lane', () => actionsRef.current.onSetLane('support'));
        return;
      }

      // Class filters
      if (/\b(suikastci|assassin)\b/.test(commandText)) {
        fire('Sınıf: Suikastçı', 'tag', () => actionsRef.current.onSetTag('Assassin'));
        return;
      }
      if (/\b(buyucu|mage)\b/.test(commandText)) {
        fire('Sınıf: Büyücü', 'tag', () => actionsRef.current.onSetTag('Mage'));
        return;
      }
      if (/\b(dovuscu|fighter)\b/.test(commandText)) {
        fire('Sınıf: Dövüşçü', 'tag', () => actionsRef.current.onSetTag('Fighter'));
        return;
      }
      if (/\b(tank)\b/.test(commandText)) {
        fire('Sınıf: Tank', 'tag', () => actionsRef.current.onSetTag('Tank'));
        return;
      }

      // Reset filters
      if (/\b(hepsi|tum sampiyonlar|sifirla|temizle)\b/.test(commandText)) {
        fire('Filtreler Sıfırlandı', 'reset', () => {
          actionsRef.current.onSetLane('all');
          actionsRef.current.onSetTag('all');
        });
        return;
      }

      // Cinema / Streamer mode
      if (/\b(sahne modu|yayin modu|sinema modu|hud gizle)\b/.test(commandText)) {
        fire('Sinema Modu', 'cinema', () => actionsRef.current.onToggleCinemaMode());
      }
    },
    [canTrigger]
  );

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec || !enabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let latest = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        latest += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      processTranscript(latest, isFinal);
    };

    recognition.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setErrorMsg('Mikrofon izni reddedildi');
        setListening(false);
      } else if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        setErrorMsg(`Ses hatası: ${ev.error}`);
      }
    };

    recognition.onend = () => {
      if (enabledRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    let started = false;
    const startTimer = window.setTimeout(() => {
      try {
        recognition.start();
        started = true;
        setListening(true);
        setErrorMsg(null);
      } catch {
        setListening(false);
      }
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      recognitionRef.current = null;
      if (started) {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [enabled, processTranscript]);

  return {
    supported,
    listening: enabled && listening,
    lastTranscript,
    lastMatchedCommand,
    errorMsg: enabled ? errorMsg : null,
  };
}
