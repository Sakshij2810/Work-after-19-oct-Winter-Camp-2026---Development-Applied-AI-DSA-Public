function ProgressRing({ percentage, isWinner, isTie, size = 76 }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, Number(percentage) || 0));

  const percentageText = Number(percentage).toFixed(1);

  const strokeColor = isTie ? "#64748B" : isWinner ? "#22C55E" : "#3B82F6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      className="shrink-0"
      role="img"
      aria-label={`${percentageText}% score share`}
    >
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="6"
      />

      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress / 100)}
        transform="rotate(-90 36 36)"
      />

      <text
        x="36"
        y="39"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#0A0A0A"
      >
        {percentageText}%
      </text>
    </svg>
  );
}

function ProfileCard({ user, isWinner, isTie, percentage, score }) {
  const cardStyles = isWinner
    ? "border-2 border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.20),0_0_50px_rgba(34,197,94,0.10)]"
    : "border border-black/10 shadow-sm";

  const badgeStyles = isTie
    ? "bg-slate-200 text-slate-600"
    : isWinner
      ? "bg-green-500 text-white"
      : "bg-slate-200 text-slate-500";

  const badgeText = isTie ? "🤝 TIE" : isWinner ? "🏆 WINNER" : "DEFEATED";

  const scoreText = Number(score).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

  return (
    <div
      className={`relative rounded-xl bg-white p-4 transition-all duration-300 sm:p-5 ${cardStyles}`}
    >
      {/* Winner / defeated badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span
          className={`whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-extrabold tracking-wider ${badgeStyles}`}
        >
          {badgeText}
        </span>
      </div>

      {/* GitHub profile information */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            className={`h-16 w-16 shrink-0 rounded-full border-2 object-cover ${
              isWinner && !isTie ? "border-green-500" : "border-black/10"
            }`}
          />

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#0A0A0A]">
              {user.name || user.login}
            </h3>

            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              @{user.login}
            </a>
          </div>
        </div>

        <div className="text-center">
          <ProgressRing
            percentage={percentage}
            isWinner={isWinner}
            isTie={isTie}
            size={76}
          />
          <p className="mt-1 text-[10px] text-black/45">Score - {scoreText}</p>
        </div>
      </div>

      <p className="mt-3 min-h-10 text-sm text-black/60">
        {user.bio || "No bio available."}
      </p>

      {/* Profile statistics */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[#F8F9FA] p-2 text-center">
          <p className="text-lg font-bold">
            {user.public_repos.toLocaleString()}
          </p>
          <p className="text-[10px] text-black/50">Repositories</p>
        </div>

        <div className="rounded-lg bg-[#F8F9FA] p-2 text-center">
          <p className="text-lg font-bold">{user.followers.toLocaleString()}</p>
          <p className="text-[10px] text-black/50">Followers</p>
        </div>

        <div className="rounded-lg bg-[#F8F9FA] p-2 text-center">
          <p className="text-lg font-bold">{user.following.toLocaleString()}</p>
          <p className="text-[10px] text-black/50">Following</p>
        </div>
      </div>

      <a
        href={user.html_url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block rounded-lg border border-black/15 py-2 text-center text-xs font-medium hover:bg-black/5"
      >
        View GitHub Profile ↗
      </a>
    </div>
  );
}

export default ProfileCard;
