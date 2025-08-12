//  function calculateReliabilityScore(profile) {
//   const avgResponseTime =
//     profile.responseTimes.length > 0
//       ? profile.responseTimes.reduce((a, b) => a + b, 0) / profile.responseTimes.length
//       : 0;

//   const taskCompletionRate =
//     profile.taskCompletionRates.length > 0
//       ? (profile.taskCompletionRates.reduce((a, b) => a + b, 0) / profile.taskCompletionRates.length) * 100
//       : 0;

//   const commits = profile.githubCommits;

//   // Weighted score: lower response time is better
//   let score = 100;
//   score -= Math.min(avgResponseTime / 1000, 30); // max 30 points loss
//   score += taskCompletionRate * 0.3; // max 30 points
//   score += commits * 0.4; // every commit adds 0.4 points

//   return Math.round(Math.min(score, 100)); // clamp to 100
// }

// module.exports.calculateReliabilityScore = calculateReliabilityScore;

function calculateReliabilityScore(profile, reason = "") {
  const avgResponseTime =
    profile.responseTimes.length > 0
      ? profile.responseTimes.reduce((a, b) => a + b, 0) /
        profile.responseTimes.length
      : 0;

  const taskCompletionRate =
    profile.taskCompletionRates.length > 0
      ? (profile.taskCompletionRates.reduce((a, b) => a + b, 0) /
          profile.taskCompletionRates.length) *
        100
      : 0;

  const commits = profile.githubCommits;

  let score = 100;
  score -= Math.min(avgResponseTime / 1000, 30); // lose up to 30
  score += taskCompletionRate * 0.3; // max +30
  score += commits * 0.4; // dynamic commit points

  score = Math.round(Math.min(score, 100));

  // ✅ Add to reliabilityHistory
  if (reason) {
    profile.reliabilityHistory.push({
      date: new Date(),
      score,
      reason,
    });
  }

  return score;
}
module.exports = {
  calculateReliabilityScore,
};
