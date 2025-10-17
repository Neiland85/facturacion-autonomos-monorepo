import { useState, useEffect, useCallback, useMemo } from 'react';
import { Howl } from 'howler';

export type SoundType = 'click' | 'success' | 'error' | 'notify' | 'open' | 'close';

const soundFiles: Record<SoundType, string> = {
  click: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_click.mp3',
  success: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_success_1.mp3',
  error: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_error.mp3',
  notify: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_notification_1.mp3',
  open: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_transition_up.mp3',
  close: 'https://cdn.jsdelivr.net/gh/kool-io/kool-ui/packages/assets/sounds/ui_transition_down.mp3',
};

// Memoize the Howl instances so they are not re-created on every render
const sounds = Object.entries(soundFiles).reduce((acc, [key, src]) => {
  acc[key as SoundType] = new Howl({ src: [src], volume: 0.3 });
  return acc;
}, {} as Record<SoundType, Howl>);

export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const storedPreference = localStorage.getItem('soundEnabled');
    if (storedPreference !== null) {
      setSoundEnabled(JSON.parse(storedPreference));
    }
  }, []);

  const toggleSound = useCallback(() => {
    const newPreference = !soundEnabled;
    setSoundEnabled(newPreference);
    localStorage.setItem('soundEnabled', JSON.stringify(newPreference));
  }, [soundEnabled]);

  const playSound = useCallback((sound: SoundType) => {
    if (soundEnabled && sounds[sound]) {
      sounds[sound].play();
    }
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playSound };
};