export interface Player {
    currentRoundScore: number;
    roundPoints: number;
    id: number;
    name: string;
    points: number;
    wins: number;
    losses: number;
    draws: number;
}

export interface Team {
    id: number;
    player1: Player;
    player2: Player;
}


export interface Match {
    id: number;
    team1: Team;
    team2: Team;
    score: { team1: number; team2: number };
    court: string;
    completed?: boolean;
}

export interface Round {
    id: number;
    matches: Match[];
    roundNumber: number;
}

