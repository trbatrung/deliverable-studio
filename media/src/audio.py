# Sound for the long pieces: narration, a music bed and sound effects, muxed into the rendered videos.
#
#   python3 audio.py vo  <name>   generate missing narration lines with VoiceStudio (localhost:3900)
#   python3 audio.py fit <name>   print where each line lands against its scene
#   python3 audio.py mix <name>   build the soundtrack and mux it into media/<name>.mp4/.webm and <name>-45.*
#
# Each piece is described by audio/<name>.json: lines (at = start in seconds, or null to follow the
# previous line; until = the scene end it should finish by; text) and cues (t, fx, optional gain in dB).
# Narration is cached in audio/vo/<name>/<hash>.wav, so re-running only generates changed lines.
# render.mjs writes silent videos, so run `mix` again after any re-render.
# Levels: narration at -16 LUFS, effects at -15 dB (plus any per-cue gain), music well under the voice
# and ducked further while someone speaks. The music is synthesised here, so it is original and free to use.

import hashlib, json, os, subprocess, sys, urllib.request
import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.dirname(HERE)
AUDIO = os.path.join(HERE, 'audio')
VOICE = os.environ.get('DLV_VOICE', 'd3fd62c4')  # VoiceStudio profile "Outwords Narrator A"
SFX_DIRS = [os.path.expanduser('~/code-project/Infographic sound fx'), os.path.expanduser('~/code-project/Swooshes')]
SFX = {'swish': 'Infographic Swish', 'pop': 'Infographic Pop', 'pops': 'Infographic Pops', 'plop': 'Infographic Plops',
       'accept': 'Infographic Accept', 'slide': 'Infographic Slide', 'shine': 'Infographic Shine', 'dpops': 'Infographic Digital Pops'}
SR = 48000
SFX_DB, MUSIC_DB, VO_LUFS = -15.0, -27.0, -16.0
FF = subprocess.check_output(['python3', '-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())']).decode().strip()


def spec(name):
    return json.load(open(os.path.join(AUDIO, name + '.json')))


def vo_path(name, text):
    h = hashlib.sha1((VOICE + '|' + text).encode()).hexdigest()[:12]
    return os.path.join(AUDIO, 'vo', name, h + '.wav')


def read(path):
    """Any audio file as float32 stereo at SR."""
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def gen_vo(name):
    s = spec(name)
    os.makedirs(os.path.join(AUDIO, 'vo', name), exist_ok=True)
    for ln in s['lines']:
        p = vo_path(name, ln['text'])
        if os.path.exists(p):
            continue
        body = json.dumps({'model': 'tts-1', 'voice': VOICE, 'input': ln['text'], 'response_format': 'wav'}).encode()
        req = urllib.request.Request('http://localhost:3900/v1/audio/speech', body, {'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=600) as r, open(p, 'wb') as f:
            f.write(r.read())
        print('voiced:', ln['text'][:60])


def trimmed(path):
    """Narration line with leading and trailing silence removed."""
    a = read(path)
    m = np.abs(a).max(axis=1)
    idx = np.where(m > 0.01)[0]
    return a[max(0, idx[0] - 480): idx[-1] + 2400] if len(idx) else a


def place(name):
    s = spec(name)
    out, prev_end = [], 0.0
    for ln in s['lines']:
        a = trimmed(vo_path(name, ln['text']))
        at = ln['at'] if ln['at'] is not None else prev_end + 0.3
        at = max(at, prev_end + 0.2)
        end = at + len(a) / SR
        out.append((at, end, ln, a))
        prev_end = end
    return out


def fit(name):
    for at, end, ln, _ in place(name):
        over = end - ln['until']
        flag = 'OVER %.2fs' % over if over > 0.3 else 'ok'
        print('%6.2f-%6.2f  until %5.1f  %-12s %s' % (at, end, ln['until'], flag, ln['text'][:70]))


def music(dur):
    """A quiet original bed: soft detuned pads on a slow four-chord loop with a gentle pluck, through a synthetic room."""
    rng = np.random.default_rng(7)
    n = int(dur * SR) + SR * 3
    t = np.arange(n) / SR
    bar = 60 / 76 * 4
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[62, 69, 73, 78], [59, 66, 69, 74], [55, 62, 66, 71], [57, 64, 69, 76]]  # Dmaj7, Bm7, Gmaj7, A(add9), above the voice
    out = np.zeros((n, 2))
    for i in range(int(np.ceil(n / SR / bar))):
        c = chords[i % 4]
        a, b = int(i * bar * SR), min(n, int((i + 1) * bar * SR + 1.5 * SR))
        tt = t[a:b] - t[a]
        env = np.minimum(1, tt / 0.9) * np.where(tt > bar, np.exp(-(tt - bar) * 2.5), 1)
        for k, m in enumerate(c + [c[0] - 24]):
            for ch, det in ((0, -0.12), (1, 0.12)):
                f = hz(m) * 2 ** (det / 12 / 4)
                w = np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(4 * np.pi * f * tt) + 0.06 * np.sin(6 * np.pi * f * tt)
                out[a:b, ch] += w * env * (0.18 if k == 4 else 0.22)
        for j in range(8):  # pluck: an eighth-note arpeggio over the chord, an octave up
            s0 = a + int(j * bar / 8 * SR)
            if s0 >= n:
                break
            m = c[[0, 2, 1, 3, 2, 1, 3, 2][j]] + 12
            L = min(int(1.2 * SR), n - s0)
            pt = np.arange(L) / SR
            p = (np.sin(2 * np.pi * hz(m) * pt) + 0.3 * np.sin(4 * np.pi * hz(m) * pt)) * np.exp(-pt * 5) * np.minimum(1, pt / 0.004)
            pan = 0.35 + 0.3 * (j % 2)
            out[s0:s0 + L, 0] += p * 0.11 * (1 - pan)
            out[s0:s0 + L, 1] += p * 0.11 * pan
    # one-pole low-pass to soften, then a synthetic room
    alpha = 1 - np.exp(-2 * np.pi * 2400 / SR)
    for ch in range(2):
        out[:, ch] = lfilter([alpha], [1, alpha - 1], out[:, ch])
    ir_t = np.arange(int(2.4 * SR)) / SR
    for ch in range(2):
        ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6)
        out[:, ch] = 0.75 * out[:, ch] + 0.25 * fftconvolve(out[:, ch], ir)[:n] / 40
    out = sosfilt(butter(4, 100, 'highpass', fs=SR, output='sos'), out[: int(dur * SR)], axis=0)  # keep clear of the voice's low end
    fade_in, fade_out = int(1.5 * SR), int(2.5 * SR)
    out[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    out[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    return out / (np.sqrt(np.mean(out ** 2)) + 1e-9)  # unit RMS; gain set in mix


def db(x):
    return 10 ** (x / 20)


def loudness_gain(a, target):
    """Gain (linear) that brings a stereo signal to `target` LUFS, measured by ffmpeg's ebur128."""
    tmp = os.path.join(AUDIO, '_measure.wav')
    wavfile.write(tmp, SR, a.astype(np.float32))
    log = subprocess.run([FF, '-hide_banner', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    i = float([l for l in log.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    return db(target - i)


def mix(name):
    s = spec(name)
    n = int(s['duration'] * SR)
    voice = np.zeros((n, 2))
    for at, end, ln, a in place(name):
        a0 = int(at * SR)
        L = min(len(a), n - a0)
        voice[a0:a0 + L] += a[:L]
    voice *= loudness_gain(voice, VO_LUFS)
    fx = np.zeros((n, 2))
    cache = {}
    for c in s['cues']:
        if c['fx'] not in cache:
            fn = SFX[c['fx']] + '.wav'
            cache[c['fx']] = read(next(os.path.join(d, fn) for d in SFX_DIRS if os.path.exists(os.path.join(d, fn))))
        a = cache[c['fx']] * db(SFX_DB + c.get('gain', 0))
        a0 = int(c['t'] * SR)
        L = min(len(a), n - a0)
        fx[a0:a0 + L] += a[:L]
    bed = music(s['duration']) * db(MUSIC_DB)
    # duck the bed a further 7 dB while the narrator speaks (smoothed envelope of the voice)
    env = np.convolve((np.abs(voice).max(axis=1) > 0.02).astype(float), np.ones(int(0.35 * SR)) / int(0.35 * SR), 'same')
    bed *= (1 - (1 - db(-7)) * np.clip(env * 1.5, 0, 1))[:, None]
    mixd = voice + fx + bed
    peak = np.abs(mixd).max()
    if peak > db(-1):
        mixd *= db(-1) / peak
    wav = os.path.join(AUDIO, f'_{name}-mix.wav')
    wavfile.write(wav, SR, mixd.astype(np.float32))
    for suffix in ('', '-45'):
        base = os.path.join(MEDIA, name + suffix)
        for ext, codec in (('mp4', ['-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart']), ('webm', ['-c:a', 'libopus', '-b:a', '96k'])):
            src, tmp = f'{base}.{ext}', f'{base}.tmp.{ext}'
            subprocess.run([FF, '-v', 'error', '-y', '-i', src, '-i', wav, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', *codec, '-shortest', tmp], check=True)
            os.replace(tmp, src)
            print('muxed', os.path.basename(src))
    os.remove(wav)


if __name__ == '__main__':
    cmd, name = sys.argv[1], sys.argv[2]
    {'vo': gen_vo, 'fit': fit, 'mix': mix}[cmd](name)
