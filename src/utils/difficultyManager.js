
class DifficultyManager {
  static getConfigByAge(age) {
    if (age < 13) return DIFFICULTY_CONFIG.JUNIOR;
    if (age < 60) return DIFFICULTY_CONFIG.ADULT;
    return DIFFICULTY_CONFIG.SENIOR;
  }

  static getConfigByCategory(category) {
    return DIFFICULTY_CONFIG[category] || DIFFICULTY_CONFIG.ADULT;
  }

  static calculateGameDifficulty(gameType, level, difficultyParams) {
    const difficulty = {
      gameType,
      level,
      ...difficultyParams,
    };

    if (gameType === "GAME_A") {
      difficulty.petalSpeed =
        (difficultyParams.petalSpeed || 0.002) +
        (level - 1) * 0.0005;
    } else if (gameType === "GAME_B") {
      difficulty.playbackSpeed = max(
        20,
        (difficultyParams.jellySpeed || 60) - level * 2
      );
    } else if (gameType === "GAME_C") {
      difficulty.gridSize = min(
        (difficultyParams.tiptoeGrid || 4) + floor((level - 1) / 3),
        8
      );
      difficulty.stepInterval = max(
        10,
        (difficultyParams.tiptoeSpeed || 40) - level * 2
      );
    }

    return difficulty;
  }
}
