// ============================================
// DIFFICULTY MANAGER
// ============================================

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

    // Game-specific scaling
    if (gameType === "GAME_A") {
      // Kaleido-Pop: rotation speed increases with level
      difficulty.petalSpeed =
        (difficultyParams.petalSpeed || 0.002) +
        (level - 1) * 0.0005;
    } else if (gameType === "GAME_B") {
      // Jelly Jams: sequence gets longer and faster
      difficulty.playbackSpeed = max(
        20,
        (difficultyParams.jellySpeed || 60) - level * 2
      );
    } else if (gameType === "GAME_C") {
      // Tiptoe Trails: grid grows and speed increases
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
