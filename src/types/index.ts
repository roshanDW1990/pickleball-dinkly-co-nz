export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  location: string;
  phoneNumber?: string;
  pickleballLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  duprRating?: string;
  joinedDate: string;
  avatar?: string;
  stats: PlayerStats;
  isEmailVerified: boolean;
  verificationToken?: string;
  isAdmin?: boolean;
}

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  tournamentsWon: number;
  currentRanking: number;
  points: number;
  winRate: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  surface: 'Hard Court' | 'Clay Court' | 'Grass Court';
  format: 'Single Elimination' | 'Double Elimination' | 'Round Robin';
  skillLevel: 'Open' | 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Registration' | 'Ongoing' | 'Completed' | 'Cancelled';
  participants: string[];
  matches: Match[];
}

export interface Match {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  scheduledDate: string;
  scheduledTime: string;
  court: string;
  round: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  score?: string;
  winnerId?: string;
  notes?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  pendingVerification: boolean;
}