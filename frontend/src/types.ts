export type Topic = {
  slug: string;
  title: string;
  icon: string;
  keywords: string[];
};

export type Question = {
  id: number;
  title: string;
  question: string;
  answers: Record<string, string>;
  correct: string;
  funfact: string;
  history: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  access: boolean;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export type ProfileResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  access: boolean;
};

export type AdminUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  access: boolean;
  createdAt: string;
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export type AchievementsResponse = {
  userId: number;
  achievements: Achievement[];
};

export type FriendUser = {
  id: number;
  username: string;
  email: string;
};

export type IncomingFriendRequest = {
  id: number;
  requester: FriendUser;
};

export type SentFriendRequest = {
  id: number;
  receiver: FriendUser;
};
