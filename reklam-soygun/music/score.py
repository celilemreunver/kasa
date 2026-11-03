exec(open(__file__.replace('score.py', '_helpers.py')).read())
# 60'lar casus big band'i — özgün motifler (Mi minör → Mi majör). story.js ile aynı zamanlar.
from core.audio.sfx import whoosh, click, creak
STOP, S2, CU, WIDE, BURST, S3, GRAB = 1.5, 3.0, 4.5, 5.5, 6.0, 7.0, 7.4
S4, S5, RUN, S6, DUR_ = 9.5, 17.4, 20.0, 21.0, 25.0
LEAD.update({'trombone_stac': .015, 'jazz_bass': .0})

def stab(t, chord, vel=.8, low=None, crash=True):
    for p in chord: put('brass', nt('trumpet_stac', p, .22, vel), t - .008, .55, .15)
    for p in (low or []): put('brass', nt('trombone_stac', p, .25, vel), t - .008, .7, -.15)
    if crash: cymbal(t, .55 + vel * .3, short=vel < .7)
def bassline(t0, bars, pat, vel=.62):
    for b in range(bars):
        for i, p in enumerate(pat):
            if p: put('banjo_tuba', nt('jazz_bass', p, BEAT * .8, vel), t0 + b * BAR + i * BEAT, 1.2, -.05)
def hats(t0, t1, vel=.35, swing=.0):
    t = t0; i = 0
    while t < t1 - .01:
        put('drums_fx', S.hit('hihat', 'closed', vel * (1 if i % 2 == 0 else .7)), t + (swing if i % 2 else 0), .6, .25)
        t += BEAT / 2; i += 1
def congas(t0, t1, vel=.5):
    t = t0; i = 0
    while t < t1 - .01:
        put('drums_fx', S.hit('conga', i % 3, vel * (.8 + .2 * (i % 2))), t + BEAT / 4, .6, -.3 + .6 * (i % 2)); t += BEAT / 2; i += 1
def twang(t, p='E2', vel=.7):
    put('banjo_tuba', nt('electric_guitar', p, 1.2, vel), t, .8, .3)

# ===== A: kasa odası 0–3 =====
bassline(0, 2, ['E2', None, 'G2', 'A2'], .6)
hats(0, S2, .3)
twang(0.0, 'E2'); twang(1.0, 'Bb1', .6)
for i in range(7): wood(0.1 + i * .2, .25 + i * .02, 'c', -.3)        # koşan ayak sesleri
stab(STOP, ['E4', 'G4', 'Bb4', 'D5'], .85, ['E3', 'B3'])
put('xylo', nt('vibraphone', 'E3', 1.4, .45), STOP, .5, 0); put('xylo', nt('vibraphone', 'Bb3', 1.4, .4), STOP, .45, .1)

# ===== B: zorlama 3–6 =====
bassline(S2, 2, ['E2', 'E2', 'G2', 'Bb2'], .7)
congas(S2, BURST, .55); hats(S2, BURST, .35)
for i, (t, ch, lo) in enumerate([(S2, ['E4', 'G4', 'B4'], ['E3']), (3.5, ['F4', 'Ab4', 'C5'], ['F3']), (4.0, ['F#4', 'A4', 'C#5'], ['F#3']),
                                 (CU, ['G4', 'Bb4', 'D5'], ['G3']), (5.0, ['G#4', 'B4', 'D#5'], ['G#3']), (WIDE, ['A4', 'C5', 'E5'], ['A3'])]):
    stab(t, ch, .7 + i * .04, lo, crash=(i % 2 == 0))
for k in range(12):   # levye metal sesleri + gıcırtı
    t = S2 + k * BEAT / 2
    put('drums_fx', S.hit('triangle', None, .35 + .2 * (k % 2)), t + .02, .45, .35 * (1 if k % 2 else -1))
    if k % 4 == 1: put('drums_fx', creak(.6).astype(np.float32), t, .5, .2)
roll(5.5, BURST - .02, .2, .9)
# patlama: büyük akor + hazine parıltısı
stab(BURST, ['E5', 'G#5', 'B5'], .95, ['E3', 'B3', 'E4'])
put('drums_fx', S.hit('bass_drum', None, 1.0), BURST, 1.1, 0)
for i, p in enumerate(['B5', 'E6', 'G#6', 'B6', 'E7']): put('xylo', nt('glockenspiel', p, .6, .55), BURST + .05 + i * .05, .5, .3 - i * .12)
for p in ['E3', 'B3', 'D#4', 'G#4']: put('xylo', nt('vibraphone', p, 1.0, .45), BURST + .1, .5, 0)

# ===== C: hazine? 7–9.5 (neredeyse sessiz) =====
put('drums_fx', click(1.2, .8).astype(np.float32), GRAB + .2, .7, .2)
put('xylo', nt('vibraphone', 'B4', .6, .4), S3 + .1, .45, 0); put('xylo', nt('vibraphone', 'G4', .6, .35), S3 + .6, .4, 0)
for i, p in enumerate(('Bb4', 'B4')): put('brass', nt('trumpet_mute', p, .2 + .25 * i, .5), 9.0 + i * .2, .8, .1)   # "?" sorusu

# ===== D: uygulama 9.5–17.4 (Mi majör swing) =====
put('drums_fx', whoosh(.45, .8).astype(np.float32), S4 - .25, .6, 0)
cymbal(S4, .5)
prog = [('E2', 'G#2', 'B2', 'C#3'), ('C#2', 'E2', 'G#2', 'B2'), ('F#2', 'A2', 'C#3', 'E3'), ('B1', 'D#2', 'F#2', 'A2')]
vib = [['G#3', 'B3', 'D#4'], ['E3', 'G#3', 'B3'], ['A3', 'C#4', 'E4'], ['A3', 'D#4', 'F#4']]
b0 = S4
for b in range(4):
    t = b0 + b * BAR
    for i, p in enumerate(prog[b % 4]): put('banjo_tuba', nt('jazz_bass', p, BEAT * .85, .6), t + i * BEAT, 1.2, -.05)
    for bt_ in (1, 3):
        for p in vib[b % 4]: put('xylo', nt('vibraphone', p, BEAT * .5, .4), t + bt_ * BEAT, .4, .15)
    brush_t = t
    for i in range(4): put('drums_fx', S.hit('snare2', 'taps', .35), t + i * BEAT, .5, 0)
hats(S4, S5, .28, swing=.06)
# hafif sürdinli trompet motifi (ses altında)
for i, (o, d, p) in enumerate([(0, .5, 'B4'), (.75, .25, 'G#4'), (1, 1, 'E5'), (2.5, .5, 'D#5'), (3, 1, 'C#5'), (4.5, .5, 'B4'), (5, 1.5, 'G#4')]):
    put('brass', nt('trumpet_mute', p, d * BEAT, .42), b0 + BAR * 2 + o * BEAT, .55, .2)

# ===== E: gerçek hazine 17.4–21 =====
stab(S5, ['E5', 'G#5', 'B5', 'E6'], .95, ['E3', 'B3'])
for p in ['E4', 'G#4', 'B4']: put('brass', nt('trumpet', p, 1.4, .6), S5 + .02, .5, .1)
bassline(S5 + BAR * .5, 2, ['E2', 'B1', 'E2', 'G#2'], .65)
hats(S5, S6, .35); congas(RUN, S6, .55)
roll(RUN, S6 - .02, .2, .85)
for i in range(6): wood(RUN + .1 + i * .15, .35, 'c', .3)

# ===== F: kapanış 21–25 =====
stab(S6, ['E5', 'G#5', 'B5'], .9, ['E3', 'B3', 'E4'])
for i, p in enumerate(['B5', 'E6', 'G#6', 'B6']): put('xylo', nt('glockenspiel', p, .5, .5), S6 + .05 + i * .06, .5, 0)
bassline(S6 + BEAT * 2, 1, ['E2', 'G#2', 'B2', 'C#3'], .6)
hats(S6, 23.5, .3)
fin = 23.5
for p in ['E4', 'G#4', 'B4', 'E5']: put('brass', nt('trumpet', p, 1.3, .65), fin, .55, .1)
for p in ['E3', 'B3']: put('brass', nt('trombone', p, 1.3, .6), fin, .7, -.1)
put('banjo_tuba', nt('jazz_bass', 'E2', 1.2, .7), fin, 1.3, 0)
for p in ['E3', 'G#3', 'B3', 'D#4']: put('xylo', nt('vibraphone', p, 1.4, .45), fin, .5, 0)
cymbal(fin, .85)
twang(fin, 'E2', .6)

# ===== yankı, sessizlik, denge =====
for k in STEMS: buf[k] = S.room(buf[k], size=.25, mix=.16, damp=.55)
def gate(t0, t1, fade=.02, stems=STEMS):
    a, b = int(t0 * SR), int(t1 * SR); f = int(fade * SR)
    for k in stems:
        x = buf[k]; x[max(0, a - f):a] *= np.linspace(1, 0, min(f, a))[:, None]; x[a:b] = 0
gate(S3 + .9, 9.0, .25, ['banjo_tuba', 'brass', 'piano', 'reeds'])   # "Bu ne ya?" altında sessizlik (vibrafon kalır)
fo0 = int((DUR - .8) * SR)
for k in STEMS: buf[k][fo0:] *= np.linspace(1, 0, N - fo0)[:, None]
GAIN = {'brass': 1.0, 'reeds': 1.0, 'piano': 1.0, 'banjo_tuba': 1.0, 'drums_fx': .85, 'xylo': .9}
mix = np.zeros((N, 2), np.float32)
for k in STEMS: mix += buf[k] * GAIN[k]
mix *= .84 / float(np.quantile(np.abs(mix), .9999))
mix = np.stack([limit(mix[:, 0], .89), limit(mix[:, 1], .89)], 1).astype(np.float32)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_24')
print('score.wav', DUR, 's; tepe', round(float(np.abs(mix).max()), 3))
print('\n'.join(S.credits(['jazz_bass', 'trumpet_stac', 'trombone_stac', 'trumpet', 'trombone', 'trumpet_mute', 'vibraphone', 'glockenspiel', 'hihat', 'conga', 'triangle', 'electric_guitar', 'snare', 'snare2', 'bass_drum', 'crash', 'clash', 'woodblock'])))
