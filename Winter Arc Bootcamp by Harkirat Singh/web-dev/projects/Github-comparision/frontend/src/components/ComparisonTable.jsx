import MetricRow from "./MetricRow.jsx";

function ComparisonTable({ comparison, user1, user2 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 p-4">
        <h2 className="text-base font-bold text-[#0A0A0A]">
          Detailed comparison
        </h2>

        <p className="mt-1 text-xs text-black/50">
          Compare each metric and see which profile leads.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          <thead className="bg-[#F8F9FA]">
            <tr className="border-b border-black/10 text-black/55">
              <th className="px-3 py-3 text-left font-semibold">Metric</th>

              <th className="px-3 py-3 text-center font-semibold">
                {user1.login}
              </th>

              <th className="px-3 py-3 text-center font-semibold">
                {user2.login}
              </th>

              <th className="px-3 py-3 text-center font-semibold">
                Row winner
              </th>

              <th className="px-3 py-3 text-right font-semibold">Lead by</th>
            </tr>
          </thead>

          <tbody>
            {comparison.rows.map((metric) => (
              <MetricRow
                key={metric.key}
                metric={metric}
                user1={user1}
                user2={user2}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonTable;
