interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent {
  results: { 0: { 0: { transcript: string } } };
}
interface WakeLockSentinel {
  release(): Promise<void>;
}
interface Navigator {
  wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
}
