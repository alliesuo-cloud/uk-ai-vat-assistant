"use client";

import { useState } from "react";
import {
  analyseVat,
  formatGBP,
  getDisclaimer,
  type VatInput,
  type VatResult,
  type YesNo,
} from "@/lib/vat";

interface FormState {
  supplierName: string;
  description: string;
  net: string;
  vat: string;
  gross: string;
  ukVatNumberShown: YesNo;
  businessExpense: YesNo;
  expenseCategory: string;
}

const EMPTY_FORM: FormState = {
  supplierName: "",
  description: "",
  net: "",
  vat: "",
  gross: "",
  ukVatNumberShown: "yes",
  businessExpense: "yes",
  expenseCategory: "",
};

interface Sample {
  label: string;
  emoji: string;
  data: FormState;
}

const SAMPLES: Sample[] = [
  {
    label: "Amazon office supplies",
    emoji: "📦",
    data: {
      supplierName: "Amazon UK",
      description: "Office stationery and supplies",
      net: "100",
      vat: "20",
      gross: "120",
      ukVatNumberShown: "yes",
      businessExpense: "yes",
      expenseCategory: "Office supplies",
    },
  },
  {
    label: "Train ticket",
    emoji: "🚆",
    data: {
      supplierName: "National Rail",
      description: "Return train ticket for client visit",
      net: "45",
      vat: "0",
      gross: "45",
      ukVatNumberShown: "no",
      businessExpense: "yes",
      expenseCategory: "Travel",
    },
  },
  {
    label: "Client meal",
    emoji: "🍽️",
    data: {
      supplierName: "The Bistro Ltd",
      description: "Lunch meeting with client",
      net: "80",
      vat: "16",
      gross: "96",
      ukVatNumberShown: "yes",
      businessExpense: "yes",
      expenseCategory: "Client entertainment",
    },
  },
  {
    label: "Software subscription",
    emoji: "💻",
    data: {
      supplierName: "SaaS Co Ltd",
      description: "Monthly accounting software subscription",
      net: "50",
      vat: "10",
      gross: "60",
      ukVatNumberShown: "yes",
      businessExpense: "yes",
      expenseCategory: "Software & subscriptions",
    },
  },
];

const CATEGORIES = [
  "Office supplies",
  "Travel",
  "Client entertainment",
  "Software & subscriptions",
  "Professional fees",
  "Utilities",
  "Equipment",
  "Marketing",
  "Other",
];

export default function Home() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<VatResult | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function loadSample(sample: Sample) {
    setForm(sample.data);
    setResult(null);
  }

  function handleAnalyse(e: React.FormEvent) {
    e.preventDefault();
    const input: VatInput = {
      supplierName: form.supplierName,
      description: form.description,
      net: parseFloat(form.net) || 0,
      vat: parseFloat(form.vat) || 0,
      gross: parseFloat(form.gross) || 0,
      ukVatNumberShown: form.ukVatNumberShown,
      businessExpense: form.businessExpense,
      expenseCategory: form.expenseCategory,
    };
    setResult(analyseVat(input));
    // Smooth-scroll to result on small screens.
    requestAnimationFrame(() => {
      document
        .getElementById("result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setResult(null);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm">
              VAT
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                AI VAT Assistant
              </h1>
              <p className="text-xs text-slate-500">
                UK purchase invoice analysis
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:inline">
            For junior accountants
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Analyse UK purchase invoices for VAT treatment
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Enter the invoice details and get an instant view of the likely VAT
            rate, recoverability, VAT return boxes, and the risks to review —
            before you post it.
          </p>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <section className="lg:col-span-3">
            <form
              onSubmit={handleAnalyse}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {/* Samples */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Try a sample invoice
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => loadSample(s)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span aria-hidden>{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Supplier name" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.supplierName}
                    onChange={(e) => update("supplierName", e.target.value)}
                    placeholder="e.g. Amazon UK"
                    className={inputClass}
                  />
                </Field>

                <Field label="Invoice description" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="e.g. Office stationery and supplies"
                    className={inputClass}
                  />
                </Field>

                <Field label="Net amount (£)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.net}
                    onChange={(e) => update("net", e.target.value)}
                    placeholder="100.00"
                    className={inputClass}
                  />
                </Field>

                <Field label="VAT amount (£)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.vat}
                    onChange={(e) => update("vat", e.target.value)}
                    placeholder="20.00"
                    className={inputClass}
                  />
                </Field>

                <Field label="Gross amount (£)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.gross}
                    onChange={(e) => update("gross", e.target.value)}
                    placeholder="120.00"
                    className={inputClass}
                  />
                </Field>

                <Field label="Expense category">
                  <select
                    value={form.expenseCategory}
                    onChange={(e) => update("expenseCategory", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="UK VAT number shown?">
                  <YesNoToggle
                    name="ukVatNumberShown"
                    value={form.ukVatNumberShown}
                    onChange={(v) => update("ukVatNumberShown", v)}
                  />
                </Field>

                <Field label="Business expense?">
                  <YesNoToggle
                    name="businessExpense"
                    value={form.businessExpense}
                    onChange={(v) => update("businessExpense", v)}
                  />
                </Field>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Analyse VAT Treatment
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          {/* Result */}
          <section id="result" className="lg:col-span-2">
            {result ? (
              <ResultCard result={result} />
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  🧾
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Your VAT analysis will appear here
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in the invoice details and click “Analyse VAT
                  Treatment”.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Disclaimer */}
        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-slate-500">
          ⚠️ {getDisclaimer()}
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
          AI VAT Assistant · Built with Next.js &amp; Tailwind CSS
        </div>
      </footer>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function YesNoToggle({
  name,
  value,
  onChange,
}: {
  name: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-slate-300 bg-slate-50 p-1">
      {(["yes", "no"] as YesNo[]).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            aria-label={`${name} ${opt}`}
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
              active
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ResultCard({ result }: { result: VatResult }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-brand-600 px-6 py-4">
        <h3 className="text-base font-semibold text-white">
          VAT Treatment Analysis
        </h3>
        <p className="text-xs text-brand-100">{result.likelyVatRate}</p>
      </div>

      <div className="divide-y divide-slate-100">
        <Row label="Likely VAT rate" value={result.likelyVatRate} />
        <Row
          label="Input VAT recoverable?"
          value={
            <RecoverableBadge value={result.inputVatRecoverable} />
          }
        />
        <Row label="VAT return treatment" value={result.vatReturnTreatment} />

        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Box 4
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatGBP(result.box4Amount)}
            </p>
            <p className="text-xs text-slate-400">Input VAT reclaimed</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Box 7
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatGBP(result.box7Amount)}
            </p>
            <p className="text-xs text-slate-400">Net purchases</p>
          </div>
        </div>

        <Row label="Bookkeeping note" value={result.bookkeepingNote} />

        <div className="px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            ⚠️ Risk warning
          </p>
          <p className="mt-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {result.riskWarning}
          </p>
        </div>

        <Row
          label="Confidence level"
          value={<ConfidenceBadge value={result.confidence} />}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-slate-800">{value}</div>
    </div>
  );
}

function RecoverableBadge({
  value,
}: {
  value: VatResult["inputVatRecoverable"];
}) {
  const styles: Record<string, string> = {
    Yes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    No: "bg-rose-50 text-rose-700 ring-rose-200",
    "Review needed": "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${styles[value]}`}
    >
      {value}
    </span>
  );
}

function ConfidenceBadge({ value }: { value: VatResult["confidence"] }) {
  const styles: Record<string, string> = {
    High: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Medium: "bg-amber-50 text-amber-700 ring-amber-200",
    Low: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${styles[value]}`}
    >
      {value}
    </span>
  );
}
