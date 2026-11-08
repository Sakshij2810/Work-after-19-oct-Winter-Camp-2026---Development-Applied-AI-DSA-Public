const METRIC_DEFINITIONS = [
  {
    key: "public_repos",
    label: "Public repositories",
    weight: 1,
  },
  {
    key: "originalRepos",
    label: "Original repositories",
    weight: 2,
  },
  {
    key: "stars",
    label: "Total stars received",
    weight: 3,
  },
  {
    key: "forks",
    label: "Total forks received",
    weight: 2,
  },
  {
    key: "followers",
    label: "Followers",
    weight: 2,
  },
  {
    key: "following",
    label: "Following",
    weight: 1,
  },
  {
    key: "public_gists",
    label: "Public gists",
    weight: 1,
  },
];

function getMetricValue(user, key) {
  if (key === "stars" || key === "forks" || key === "originalRepos") {
    return user.stats[key];
  }

  return user[key] ?? 0;
}

export function calculateComparison(user1, user2) {
  let score1 = 0;
  let score2 = 0;

  // rowwise winner calculation
  const rows = METRIC_DEFINITIONS.map((metric) => {
    const value1 = getMetricValue(user1, metric.key);
    const value2 = getMetricValue(user2, metric.key);

    let winner = "tie";

    if (value1 > value2) {
      winner = "user1";
      score1 += metric.weight;
    } else if (value2 > value1) {
      winner = "user2";
      score2 += metric.weight;
    } else {
      // A tied metric gives half its weight to each user.
      score1 += metric.weight / 2;
      score2 += metric.weight / 2;
    }

    const total = value1 + value2;

    let leadPercentage;

    if (value1 == value2) {
      leadPercentage = null;
    } else {
      const winnerRowValue = Math.max(value1, value2);

      leadPercentage = total == 0 ? null : (winnerRowValue / total) * 100;
    }

    return {
      ...metric,
      value1,
      value2,
      winner,
      leadPercentage,
    };
  });

  // Overall winner calculation
  let winner = "tie";

  if (score1 > score2) {
    winner = "user1";
  } else if (score2 > score1) {
    winner = "user2";
  }

  const totalScore = score1 + score2;

  return {
    rows,
    score1,
    score2,
    winner,
    percentage1: totalScore ? (score1 / totalScore) * 100 : 50,
    percentage2: totalScore ? (score2 / totalScore) * 100 : 50,
  };
}
