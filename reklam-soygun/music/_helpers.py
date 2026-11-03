"""Kasa Defteri — Soygun: özgün 1930'lar ragtime / big band müziği (120 BPM, 25 sn)
Yardımcılar (stride, oompah, brush, roll, slide, boing, mel...) Lemo-Opuscar rubber-hose demo/music/score.py'den (MIT) alınmıştır;
tema ve düzenleme bu reklama özgüdür. Çalıştırma: /root/lemo-opuscar/.venv/bin/python music/score.py
Çıktı: music/score.wav, music/fx.wav (efektler ayrı), music/hits.json"""
import os, sys, json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = '/root/lemo-opuscar'
sys.path.insert(0, ROOT)
from core.audio import sampler as S
from core.audio import pluck as PL
from core.audio.sfx import SR, add, limit
S.seed(7)
BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
def bar(b, beat=1.0): return (b - 1) * BAR + (beat - 1) * BEAT
def bt(n): return n * BEAT            # story.js beat(n)
DUR = 25.0
N = int(round(DUR * SR))
STEMS = ['brass', 'reeds', 'piano', 'banjo_tuba', 'drums_fx', 'xylo']
buf = {k: np.zeros((N, 2), np.float32) for k in STEMS}
HITS = {}

# Attack compensation: brass/reed samples have a 15–30 ms attack, so they are placed early to land the accent on the beat (live players also push the air early)
LEAD = {'tuba_stac': .022, 'tuba': .025, 'trumpet': .018, 'trumpet_stac': .012, 'trumpet_mute': .02, 'trombone': .02, 'clarinet': .015, 'clarinet_stac': .008}
class Note(np.ndarray): pass
def put(stem, x, t, gain=1.0, pan=0.0):
    t = t - getattr(x, 'lead', 0.0)
    add(buf[stem], np.asarray(x, np.float32), t, gain, pan)

def nt(inst, pitch, dur, vel=.7, **kw):
    x = S.note(inst, pitch, dur, vel, **kw).view(Note); x.lead = LEAD.get(inst, 0.0); return x

# ——— Chords ———
CH = {  # (bass root, bass fifth, chord in the middle register)
    'F': ('F2', 'C2', ['A3', 'C4', 'F4']), 'D7': ('D2', 'A1', ['F#3', 'C4', 'D4']), 'G7': ('G2', 'D2', ['F3', 'B3', 'D4']),
    'C7': ('C2', 'G1', ['E3', 'Bb3', 'C4']), 'Dm': ('D2', 'A1', ['F3', 'A3', 'D4']), 'Bb': ('Bb1', 'F2', ['F3', 'Bb3', 'D4']),
    'A7': ('A1', 'E2', ['G3', 'C#4', 'E4']), 'E7': ('E2', 'B1', ['G#3', 'D4', 'E4']), 'G': ('G2', 'D2', ['B3', 'D4', 'G4']),
    'Gm': ('G2', 'D2', ['Bb3', 'D4', 'G4']), 'A': ('A1', 'E2', ['A3', 'C#4', 'E4']), 'C': ('C2', 'G1', ['E3', 'G3', 'C4']),
    'Dm6': ('D2', 'A1', ['F3', 'B3', 'D4']), 'Fdim': ('F2', 'B1', ['Ab3', 'B3', 'D4']), 'Eb7': ('Eb2', 'Bb1', ['G3', 'Db4', 'Eb4']),
}
def up(p, k=12): return S.name(S.midi(p) + k)

def stride(b, chords, vel=.62, beats=(1, 2, 3, 4)):
    """Stride piano: bass (octaves) on beats 1/3, middle-register chords (short) on beats 2/4. chords = [first two beats, last two beats]"""
    for bt in beats:
        c = chords[0] if bt <= 2 else chords[1]; root, fifth, tri = CH[c]; t = bar(b, bt)
        if bt in (1, 3):
            p = root if bt == 1 else fifth
            put('piano', nt('upright', p, BEAT * .8, vel), t, .9, -.15)
            put('piano', nt('upright', up(p), BEAT * .8, vel * .85), t, .7, -.15)
        else:
            for p in tri: put('piano', nt('upright', p, BEAT * .35, vel * .8), t, .55, .1)

def oompah(b, chords, vel=.6, two_beat=False):
    """Tuba oom (beats 1, 3) + banjo pah (strummed on beats 2, 4)"""
    for bt in (1, 3):
        c = chords[0] if bt == 1 else chords[1]; root, fifth, tri = CH[c]
        p = up(root, 12) if S.midi(root) < 36 else root
        if bt == 3 and not two_beat: p = up(fifth, 12) if S.midi(fifth) < 36 else fifth
        if two_beat and bt == 3: continue
        put('banjo_tuba', nt('tuba_stac', p, BEAT * .6, vel), bar(b, bt), 1.25, -.1)
    for bt in (2, 4):
        if two_beat and bt == 2: continue
        c = chords[0] if bt == 2 else chords[1]; tri = CH[c][2]
        x = PL.strum('banjo', [up(p) for p in tri] + [up(tri[0], 24)], BEAT * .5, vel * .9, spread=.012)
        put('banjo_tuba', x, bar(b, bt) - .012, .55, .35)

def brush(b, vel=.5, beats=(1, 2, 3, 4)):
    """Snare brushes: one sweep per beat (band-passed noise, slow attack), plus a light tap on beats 2/4"""
    rng = np.random.default_rng(int(b * 13))
    for bt in beats:
        n = int(BEAT * .9 * SR); w = rng.standard_normal(n)
        w = sosfilt(butter(2, [1800, 7000], 'band', fs=SR, output='sos'), w)
        e = np.linspace(0, 1, n) ** .5 * np.exp(-np.linspace(0, 4, n)); x = (w * e * .05 * vel).astype(np.float32)
        put('drums_fx', x, bar(b, bt), 1, .05)
        if bt in (2, 4): put('drums_fx', S.hit('snare2', 'taps', vel * .7), bar(b, bt), .9, 0)

def snare_back(b, vel=.6):
    for bt in (2, 4): put('drums_fx', S.hit('snare', 'on', vel), bar(b, bt), .8, 0)
    put('drums_fx', S.hit('bass_drum', None, vel * .8), bar(b, 1), .9, 0)
    put('drums_fx', S.hit('bass_drum', None, vel * .7), bar(b, 3), .9, 0)

def roll(t0, t1, v0=.3, v1=.8):
    """Snare roll (sampled roll variant cut to length) + crescendo"""
    d = t1 - t0; x = S.hit('snare', 'roll', .8)
    if len(x) < d * SR: x = np.concatenate([x] * int(np.ceil(d * SR / len(x) + 1)))
    x = x[:int(d * SR)].copy(); x *= np.linspace(v0, v1, len(x), dtype=np.float32); x[-240:] *= np.linspace(1, 0, 240)
    put('drums_fx', x, t0, 1.0, 0)

def cymbal(t, vel=.8, short=False, pan=.1):
    put('drums_fx', S.hit('clash', 'short') if short else S.hit('crash', None, vel), t - .012, .75 if not short else .9, pan)

def slide(t0, d, f0, f1, vel=.25, stem='drums_fx', curve=1.0):
    """Slide whistle: sine + breath noise, exponential glide, light vibrato"""
    n = int(d * SR); u = np.linspace(0, 1, n) ** curve
    f = f0 * (f1 / f0) ** u * (1 + .006 * np.sin(2 * np.pi * 6 * np.arange(n) / SR))
    ph = 2 * np.pi * np.cumsum(f) / SR
    breath = sosfilt(butter(2, [1500, 5000], 'band', fs=SR, output='sos'), np.random.default_rng(3).standard_normal(n)) * .08
    env = np.minimum(1, np.arange(n) / (.03 * SR)) * np.minimum(1, (n - np.arange(n)) / (.05 * SR))
    x = (np.sin(ph) + .12 * np.sin(2 * ph) + breath) * env * vel
    put(stem, x.astype(np.float32), t0, 1, .2)

def boing(t, vel=.35):
    """Spring boing: descending FM chirp + wobble"""
    d = .55; n = int(d * SR); tt = np.arange(n) / SR
    f = 220 * (1 + .9 * np.exp(-tt * 9)) * (1 + .12 * np.sin(2 * np.pi * 18 * tt) * np.exp(-tt * 3))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR + 2.2 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.exp(-tt * 5)) * np.exp(-tt * 4.5)
    put('drums_fx', (x * vel).astype(np.float32), t, 1, -.1)

def wood(t, vel=.6, v='c', pan=.25):
    put('drums_fx', S.hit('woodblock', v, vel), t, 1.0, pan)

def mel(inst, b0, notes, vel=.72, pan=0., stem='reeds', legato=.95, gain=1.0, shift=0):
    """notes = [(beats from beat 1 of bar b0, duration in beats, pitch), ...]"""
    for off, d, p in notes:
        if p is None: continue
        pp = up(p, shift) if shift else p
        put(stem, nt(inst, pp, d * BEAT * legato, vel), bar(b0) + off * BEAT, gain, pan)

