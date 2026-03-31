import type { Achievement, Topic } from './types';

export const API_BASE_URL = 'http://localhost:3000';

export const TOPICS: Topic[] = [
  { slug: 'alapfogalmak', title: 'Alapfogalmak', icon: '🌍', keywords: ['alapfogalmak', 'alap', 'bevezető'] },
  { slug: 'ujrahasznositas', title: 'Újrahasznosítás', icon: '♻️', keywords: ['újrahasznosítás', 'szelektív'] },
  { slug: 'vizvedelem', title: 'Vízvédelem', icon: '💧', keywords: ['vízvédelem', 'víz'] },
  { slug: 'erdok', title: 'Erdők', icon: '🌳', keywords: ['erdők', 'erdő', 'fa'] },
];

export const ACHIEVEMENT_TEMPLATES: Achievement[] = [
  { id: 1, title: 'Első lépések', description: 'Lépj be először az alkalmazásba.', completed: true },
  { id: 2, title: 'Kíváncsi felfedező', description: 'Nyiss meg legalább 1 témát.', completed: true },
  { id: 3, title: 'Hulladékharcos', description: 'Olvass el 5 újrahasznosításhoz kapcsolódó kérdést.', completed: false },
  { id: 4, title: 'Vízőr', description: 'Nyisd meg a Vízvédelem témát 3 alkalommal.', completed: false },
  { id: 5, title: 'Erdőbarát', description: 'Olvass el 10 erdőkkel kapcsolatos kérdést.', completed: false },
  { id: 6, title: 'Kitartó tanuló', description: 'Lépj be 7 egymást követő napon.', completed: false },
  { id: 7, title: 'Napi hős', description: 'Teljesíts 3 napi feladatot.', completed: false },
  { id: 8, title: 'Közösségi tag', description: 'Adj hozzá legalább 1 barátot.', completed: false },
  { id: 9, title: 'Pontgyűjtő', description: 'Gyűjts össze 500 pontot.', completed: false },
  { id: 10, title: 'Öko mester', description: 'Nyisd meg az összes témát legalább egyszer.', completed: false },
];

export const TOKEN_KEY = 'wdad_access_token';
export const USER_KEY = 'wdad_user';
