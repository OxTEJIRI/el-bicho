"""Makes the reaction sounds with Kokoro-82M (local neural TTS) and one synthesised chime.
Run: python scripts/make-sounds.py   ->  public/sounds/*.wav, then convert to mp3 with ffmpeg.
They are original recordings: voiced imitations of the reactions, not clips of anyone's real audio."""
import numpy as np, soundfile as sf, sys
from pathlib import Path
from kokoro_onnx import Kokoro

CACHE = Path.home() / '.cache' / 'kokoro'
K = Kokoro(str(CACHE / 'kokoro-v1.0.onnx'), str(CACHE / 'voices-v1.0.bin'))
OUT = Path('public/sounds'); OUT.mkdir(parents=True, exist_ok=True)
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'


def say(name, phonemes, speed):
    y, sr = K.create(phonemes, voice=VOICE, speed=speed, lang='en-us', is_phonemes=True)
    y = y / max(1e-6, np.abs(y).max()) * 0.9
    fade = int(sr * 0.04)
    y[-fade:] *= np.linspace(1, 0, fade)
    sf.write(OUT / f'{name}.wav', y, sr)
    print(name, round(len(y) / sr, 2), 's', phonemes)


say('wow', 'wˈaʊ', 0.5)            # "Wowwww"
say('siuuu', 'sˈiːˈuːuː', 0.5)     # "Siuuuuu"
say('tears', 'ˈɔːw', 0.5)             # "Awwww"

# memory chime: two soft bell tones
sr = 24000
def bell(f, dur, amp):
    t = np.linspace(0, dur, int(sr * dur), False)
    return amp * np.sin(2 * np.pi * f * t) * np.exp(-4.5 * t)
chime = np.concatenate([bell(880, 0.45, 0.6), bell(1318.5, 0.9, 0.6)])
sf.write(OUT / 'memory.wav', chime, sr)
print('memory chime', round(len(chime) / sr, 2), 's')
