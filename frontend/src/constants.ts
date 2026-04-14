import type { Achievement, Topic } from './types';

export const API_BASE_URL = 'http://localhost:3000';

export const TOPICS: Topic[] = [
  { slug: 'alapfogalmak', title: 'Alapfogalmak', icon: '🌍', keywords: ['alapfogalmak', 'alap', 'bevezető'], image: `${API_BASE_URL}/images/alapfogalmak.jpg` },
  { slug: 'ujrahasznositas', title: 'Újrahasznosítás', icon: '♻️', keywords: ['újrahasznosítás', 'szelektív'], image: `${API_BASE_URL}/images/ujrahasznositas.jpg` },
  { slug: 'vizvedelem', title: 'Vízvédelem', icon: '💧', keywords: ['vízvédelem', 'víz'], image: `${API_BASE_URL}/images/vizvedelem.jpg` },
  { slug: 'erdok', title: 'Erdők', icon: '🌳', keywords: ['erdők', 'erdő', 'fa'], image: `${API_BASE_URL}/images/erdok.jpg` },
];

export const ACHIEVEMENT_TEMPLATES: Achievement[] = [
  { id: 1, title: 'Első lépések', description: 'Lépj be először az alkalmazásba.', completed: true, image: 'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 2, title: 'Kíváncsi felfedező', description: 'Nyiss meg legalább 1 témát.', completed: true, image: 'https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 3, title: 'Hulladékharcos', description: 'Olvass el 5 újrahasznosításhoz kapcsolódó kérdést.', completed: false, image: 'https://images.pexels.com/photos/761297/pexels-photo-761297.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 4, title: 'Vízőr', description: 'Nyisd meg a Vízvédelem témát 3 alkalommal.', completed: false, image: 'https://images.pexels.com/photos/1001633/pexels-photo-1001633.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 5, title: 'Erdőbarát', description: 'Olvass el 10 erdőkkel kapcsolatos kérdést.', completed: false, image: 'https://images.pexels.com/photos/2400594/pexels-photo-2400594.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 6, title: 'Kitartó tanuló', description: 'Lépj be 7 egymást követő napon.', completed: false, image: 'https://images.pexels.com/photos/4458554/pexels-photo-4458554.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 7, title: 'Napi hős', description: 'Teljesíts 3 napi feladatot.', completed: false, image: 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 8, title: 'Közösségi tag', description: 'Adj hozzá legalább 1 barátot.', completed: false, image: 'https://images.pexels.com/photos/461049/pexels-photo-461049.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 9, title: 'Pontgyűjtő', description: 'Gyűjts össze 500 pontot.', completed: false, image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 10, title: 'Öko mester', description: 'Nyisd meg az összes témát legalább egyszer.', completed: false, image: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 11, title: 'Titkos felfedező', description: 'Találd meg a titkos oldalt!', completed: false, image: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export const TOKEN_KEY = 'wdad_access_token';
export const USER_KEY = 'wdad_user';
