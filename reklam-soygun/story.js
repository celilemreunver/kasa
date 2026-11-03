// story.js — 120 BPM: 1 vuruş = 0,5 sn = 12 kare. Tüm zamanlar saniye.
export const BEAT = .5;
export const S1 = 0, STOP = 1.5, S2 = 3.0, CU = 4.5, WIDE = 5.5, BURST = 6.0, S3 = 7.0, GRAB = 7.4;
export const S4 = 9.5, SUMMARY = 13.5, MENU = 15.0, JOIN = 15.9, S5 = 17.4, RUN = 20.0, S6 = 21.0, DUR = 25.0;
export const STABS = [STOP, S2, 3.5, 4.0, CU, 5.0, WIDE, BURST, S4, S5, S6];
export const VO = [['t1', 1.3], ['t2', 7.8], ['n1', 9.7], ['n2', 13.5], ['t3', 17.7], ['n3', 21.4]];
// altyazı şeridi: [başlangıç, bitiş, metin]
export const SUBS = [
  [1.5, 3.3, 'İşte kasa! Orada!'],
  [8.0, 9.45, 'Bu ne ya?'],
  [10.0, 11.65, 'Kasa Defteri ile gelirini ve giderini'],
  [11.65, 13.25, 'saniyeler içinde kaydet.'],
  [13.75, 15.1, 'Tüm ayını tek seferde gör,'],
  [15.12, 16.95, 'ailenle aynı defteri paylaş!'],
  [17.95, 19.4, 'İşte bu gerçek hazine!'],
  [19.42, 20.6, 'Hemen gidelim!'],
];
