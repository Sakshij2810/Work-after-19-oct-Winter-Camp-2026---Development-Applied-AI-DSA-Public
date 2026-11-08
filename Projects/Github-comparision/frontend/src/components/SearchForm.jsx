import { useState } from "react";
import { FiSearch, FiLoader } from "react-icons/fi";

import { fetchGithubProfiles } from "../services/githubApi.js";
import { calculateComparison } from "../utils/scoring.js";

import ProfileCard from "./ProfileCard.jsx";
import ComparisonTable from "./ComparisonTable.jsx";

function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-black/70">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border-2 border-black/25 bg-white px-2.5 py-2 text-xs text-[#0A0A0A] outline-none transition-colors placeholder-black/30 focus:border-black/60"
      />
    </div>
  );
}

const SearchForm = () => {
  const [user1Url, setUser1Url] = useState("");
  const [user2Url, setUser2Url] = useState("");

  const [profiles, setProfiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (loading) return;

    setError("");

    if (!user1Url.trim() || !user2Url.trim()) {
      setError("Please enter both GitHub profile URLs.");
      return;
    }

    setLoading(true);
    setProfiles(null);

    try {
      const [user1, user2] = await fetchGithubProfiles(user1Url, user2Url);

      setProfiles({ user1, user2 });
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub profiles.");
    } finally {
      setLoading(false);
    }
  };

  console.log("profiles.....", profiles);

  const comparison = profiles
    ? calculateComparison(profiles.user1, profiles.user2)
    : null;

  console.log("comparison......", comparison);

  const isTie = comparison && comparison.winner === "tie";

  const winner =
    comparison && comparison.winner === "user1"
      ? profiles?.user1
      : profiles?.user2;

  return (
    <div className="flex flex-col gap-4">
      {/* Search form */}
      <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
          <div className="w-full flex-1">
            <Input
              label="User 1"
              value={user1Url}
              onChange={setUser1Url}
              placeholder="Enter GitHub profile URL or username"
            />
          </div>

          <p className="shrink-0 text-sm font-medium text-black/50">vs</p>

          <div className="w-full flex-1">
            <Input
              label="User 2"
              value={user2Url}
              onChange={setUser2Url}
              placeholder="Enter GitHub profile URL or username"
            />
          </div>

          <button
            type="button"
            onClick={handleCompare}
            disabled={loading}
            className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/20 py-2.5 text-xs text-black/60 transition-all hover:border-black/40 hover:text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50 md:mt-5 md:w-auto md:px-6"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={13} />
                Fetching profiles...
              </>
            ) : (
              <>
                <FiSearch size={13} />
                Compare
              </>
            )}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700"
          >
            {error}
          </p>
        )}
      </div>

      {/* Comparison results */}
      {profiles && comparison && (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <ProfileCard
              user={profiles.user1}
              isWinner={winner == profiles.user1 ? true : false}
              isTie={isTie}
              percentage={comparison.percentage1}
              score={comparison.score1}
            />

            <ProfileCard
              user={profiles.user2}
              isWinner={winner == profiles.user2 ? true : false}
              isTie={isTie}
              percentage={comparison.percentage2}
              score={comparison.score2}
            />
          </div>

          <ComparisonTable
            comparison={comparison}
            user1={profiles.user1}
            user2={profiles.user2}
          />
        </div>
      )}
    </div>
  );
};

export default SearchForm;
