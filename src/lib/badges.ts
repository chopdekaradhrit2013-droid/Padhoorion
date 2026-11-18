/**
 * PadhoOrion Student Badges Engine
 * Calculates badges based on student community contributions
 */

export interface StudentStats {
  uploadsCount: number;
  mathUploads: number;
  scienceUploads: number;
  downloadsCount: number;
  likesCount: number;
  commentsCount: number;
}

export interface StudentBadge {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

export function computeStudentBadges(userStats: StudentStats): StudentBadge[] {
  const badges: StudentBadge[] = [];

  if (userStats.uploadsCount >= 1) {
    badges.push({
      id: "first_contributor",
      label: "First Contributor",
      icon: "🌟",
      desc: "Uploaded their first classroom study copy",
      color: "bg-amber-100 text-amber-900 border-amber-300",
    });
  }

  if (userStats.mathUploads >= 2) {
    badges.push({
      id: "math_maestro",
      label: "Math Maestro",
      icon: "📐",
      desc: "Shared 2+ Mathematics formula sheets or solved problem sets",
      color: "bg-indigo-100 text-indigo-900 border-indigo-300",
    });
  }

  if (userStats.scienceUploads >= 2) {
    badges.push({
      id: "science_scribe",
      label: "Science Scribe",
      icon: "🔬",
      desc: "Authored 2+ Science lab/lecture summaries",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    });
  }

  if (userStats.downloadsCount >= 5) {
    badges.push({
      id: "exam_lifesaver",
      label: "Exam Lifesaver",
      icon: "🏅",
      desc: "Study notes helped classmates with 5+ downloads",
      color: "bg-rose-100 text-rose-900 border-rose-300",
    });
  }

  if (userStats.likesCount >= 2) {
    badges.push({
      id: "peer_verified_topper",
      label: "Peer Verified Topper",
      icon: "🎯",
      desc: "Received multiple peer endorsements and upvotes",
      color: "bg-purple-100 text-purple-900 border-purple-300",
    });
  }

  if (userStats.commentsCount >= 3) {
    badges.push({
      id: "helpful_classmate",
      label: "Helpful Classmate",
      icon: "💡",
      desc: "Actively answered doubts and shared tips in note discussions",
      color: "bg-teal-100 text-teal-900 border-teal-300",
    });
  }

  return badges;
}

