import React, { useMemo, useState } from "react";
import { round2, formatCurrency } from "@/lib/invoice-calc";
import { useToast } from "@/hooks/use-toast";

export default function CISCalculator() {
  const [gross, setGross] = useState<number>(0);
  const [materials, setMaterials] = useState<number>(0);
  const [rate, setRate] = useState<number>(20); // 20% or 30%
  const [retention, setRetention] = useState<number>(0);
  const { toast } = useToast();

  const result = useMemo(() => {
    const labour = Math.max(0, gross - materials);
    const cisDeduction = round2(labour * (rate / 100));
    const retentionAmt = round2(gross * (retention / 100));
    const netPaid = round2(gross - cisDeduction - retentionAmt);
    return { labour, cisDeduction, retentionAmt, netPaid };
  }, [gross, materials, rate, retention]);

  function copyBreakdown() {
    const text = [
      `Gross: ${formatCurrency(gross)}`,
      `Materials: ${formatCurrency(materials)}`,
      `Labour: ${formatCurrency(result.labour)}`,
      `CIS @ ${rate}%: -${formatCurrency(result.cisDeduction)}`,
      `Retention @ ${retention}%: -${formatCurrency(result.retentionAmt)}`,
      `Net payment: ${formatCurrency(result.netPaid)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast?.({ title: "Copied", description: "CIS breakdown copied to clipboard." });
  }

  return (
    <section className="card animate-fade-in">
      <h3 className="text-lg font-semibold mb-3">CIS Deduction Calculator</h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div className="grid gap-2">
          <label className="text-sm">Gross amount (£)</label>
          <input className="input" type="number" step="0.01" value={gross} onChange={(e)=> setGross(parseFloat(e.target.value || "0"))} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Materials (£)</label>
          <input className="input" type="number" step="0.01" value={materials} onChange={(e)=> setMaterials(parseFloat(e.target.value || "0"))} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">CIS rate</label>
          <select className="input" value={rate} onChange={(e)=> setRate(parseInt(e.target.value, 10))}>
            <option value={20}>20% (Registered)</option>
            <option value={30}>30% (Unverified)</option>
            <option value={0}>0% (Gross)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Retention (%)</label>
          <input className="input" type="number" step="0.1" value={retention} onChange={(e)=> setRetention(parseFloat(e.target.value || "0"))} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <SummaryItem label="Labour" value={formatCurrency(result.labour)} />
        <SummaryItem label={`CIS @ ${rate}%`} value={`-${formatCurrency(result.cisDeduction)}`} />
        <SummaryItem label={`Retention @ ${retention}%`} value={`-${formatCurrency(result.retentionAmt)}`} />
        <SummaryItem label="Net payment" value={formatCurrency(result.netPaid)} />
      </div>

      <div className="mt-4 flex justify-end">
        <button className="button" onClick={copyBreakdown}>Copy breakdown</button>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 rounded-md p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
