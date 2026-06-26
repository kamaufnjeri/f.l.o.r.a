"use client";

type Props = {
  difference: number;
  currency?: string;
};

export default function BalanceStatus({
  difference,
  currency = "KSHS",
}: Props) {
  const isBalanced = difference === 0;

  const absDiff = Math.abs(difference);

  const label =
    difference > 0
      ? `DR`
      : difference < 0
      ? `CR`
      : "";

  return (
    <div className="text-sm">
      {isBalanced ? (
        <span className="text-green-600 font-medium">
          ✓ Balanced
        </span>
      ) : (
        <span className="text-red-600 font-medium">
          ✗ Not Balanced (
          {label} {currency} {absDiff.toFixed(2)}
          )
        </span>
      )}
    </div>
  );
}