function MetricRow({ metric, user1, user2 }) {
  const isWinner1 = metric.winner === "user1";
  const isWinner2 = metric.winner === "user2";
  const isTie = metric.winner === "tie";

  const cellClass = (isWinner) =>
    `rounded-md px-2 py-2 text-center font-semibold ${
      isWinner ? "bg-green-100 text-green-800" : "text-black/70"
    }`;

  const formatValue = (value) => value.toLocaleString();

  let winnerText = "Tie";

  if (isWinner1) winnerText = user1.login;
  if (isWinner2) winnerText = user2.login;

  let leadText = "Equal";

  if (!isTie) {
    leadText =
      metric.leadPercentage === null
        ? "N/A"
        : `${metric.leadPercentage.toLocaleString(undefined, {
            maximumFractionDigits: 1,
          })}%`;
  }

  return (
    <tr className="border-b border-black/5 last:border-0">
      <td className="px-3 py-3 text-left">
        <p className="font-medium text-[#0A0A0A]">{metric.label}</p>
        <p className="mt-1 text-[10px] text-black/45">
          Weight: {metric.weight}
        </p>
      </td>

      <td className={cellClass(isWinner1)}>{formatValue(metric.value1)}</td>

      <td className={cellClass(isWinner2)}>{formatValue(metric.value2)}</td>

      <td className="px-3 py-3 text-center text-xs font-medium">
        <span className={isTie ? "text-black/50" : "text-green-700"}>
          {winnerText}
        </span>
      </td>

      <td className="px-3 py-3 text-right text-xs text-black/60">{leadText}</td>
    </tr>
  );
}

export default MetricRow;
