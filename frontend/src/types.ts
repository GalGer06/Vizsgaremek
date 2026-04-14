export type Topic = {
  slug: string;
  title: string;
  icon: string;
  keywords: string[];
  image?: string;
};

export type Question = {
  id: number;
  title: string;
  question: string;
  answers: string[];
  correct: string;
  funfact: string;
  createdAt: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  access: boolean;
  profilePicture?: string;
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
  profilePicture?: string;
  createdAt: string;
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  image?: string;
};

export type AchievementsResponse = {
  userId: number;
  achievements: Achievement[];
};

export type FriendUser = {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
};

export type HomeButton = {
  id: number;
  label: string;
  link: string;
  image: string;
  order: number;
};

export type IncomingFriendRequest = {
  id: number;
  requester: FriendUser;
};

export type SentFriendRequest = {
  id: number;
  receiver: FriendUser;
};

export type LeaderboardEntry = {
  rank: number;
  id: number;
  username: string;
  profilePicture?: string;
  points: number;
  level: number;
  isCurrentUser: boolean;
};
