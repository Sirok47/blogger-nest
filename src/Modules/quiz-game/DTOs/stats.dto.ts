export type QuizGameStatsViewModel = {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
};

export type QuizGameStatsWithUserViewModel = QuizGameStatsViewModel & {
  player: {
    id: string;
    login: string;
  };
};
