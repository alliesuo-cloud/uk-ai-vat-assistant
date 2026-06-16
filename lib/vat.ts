// Core VAT analysis logic for the AI VAT Assistant.
//
// IMPORTANT: This is a rules-based, AI-assisted guide. It is NOT professional
// tax advice. The logic models common UK VAT treatments for purchase invoices
// to help a junior accountant triage an invoice and decide what to review.

export type YesNo = "yes" | "no";

export interface VatInput {
  supplierName: string;
  description: string;
  net: number;
  vat: number;
  gross: number;
  ukVatNumberShown: YesNo;
  businessExpense: YesNo;
  expenseCategory: string;
}

export type Recoverable = "Yes" | "No" | "Review needed";
export type Confidence = "High" | "Medium" | "Low";

export interface VatResult {
  likelyVatRate: string;
  ratePercent: number | null;
  inputVatRecoverable: Recoverable;
  vatReturnTreatment: string;
  box4Amount: number;
  box7Amount: number;
  bookkeepingNote: string;
  riskWarning: string;
  confidence: Confidence;
}

const DISCLAIMER =
  "This is an AI-assisted VAT guide, not professional tax advice.";

export function getDisclaimer(): string {
  return DISCLAIMER;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Is `ratio` (vat/net) approximately `target` (e.g. 0.20)?
// Allow a small tolerance to absorb rounding on the invoice.
function near(ratio: number, target: number, tolerance = 0.015): boolean {
  return Math.abs(ratio - target) <= tolerance;
}

export function analyseVat(input: VatInput): VatResult {
  const net = Number(input.net) || 0;
  const vat = Number(input.vat) || 0;
  const gross = Number(input.gross) || 0;

  const hasVatNumber = input.ukVatNumberShown === "yes";
  const isBusiness = input.businessExpense === "yes";

  // Business/client entertainment input VAT is generally blocked under UK VAT
  // rules (with limited exceptions, e.g. some staff entertainment). Flag it.
  const haystack = `${input.expenseCategory} ${input.description}`.toLowerCase();
  const looksLikeEntertainment =
    /entertain|client meal|hospitality/.test(haystack);

  const ratio = net > 0 ? vat / net : 0;
  const risks: string[] = [];

  // --- 1. Classify the likely VAT rate -----------------------------------
  let likelyVatRate: string;
  let ratePercent: number | null;
  let needsRateReview = false;

  if (vat === 0) {
    likelyVatRate = "Zero-rated / exempt / no VAT";
    ratePercent = 0;
    needsRateReview = true;
    risks.push(
      "No VAT was charged. Confirm whether the supply is zero-rated, exempt, outside the scope of VAT, or whether the supplier is not VAT registered — each has a different VAT return treatment."
    );
  } else if (near(ratio, 0.2)) {
    likelyVatRate = "Standard-rated (20%)";
    ratePercent = 20;
  } else if (near(ratio, 0.05)) {
    likelyVatRate = "Reduced-rated (5%)";
    ratePercent = 5;
  } else {
    likelyVatRate = `Unusual VAT ratio (~${(ratio * 100).toFixed(1)}% of net)`;
    ratePercent = round2(ratio * 100);
    needsRateReview = true;
    risks.push(
      `The VAT charged is ~${(ratio * 100).toFixed(
        1
      )}% of the net amount, which does not match the standard 20% or reduced 5% rate. Check the invoice for errors or a mixed/partial supply.`
    );
  }

  // --- 2. Sanity-check the arithmetic -------------------------------------
  if (net > 0 || vat > 0 || gross > 0) {
    const expectedGross = round2(net + vat);
    if (gross > 0 && Math.abs(expectedGross - round2(gross)) > 0.02) {
      risks.push(
        `Net (${formatGBP(net)}) + VAT (${formatGBP(
          vat
        )}) = ${formatGBP(expectedGross)}, which does not match the gross of ${formatGBP(
          gross
        )}. Re-check the figures on the invoice.`
      );
    }
  }

  // --- 3. Is the input VAT recoverable? -----------------------------------
  let inputVatRecoverable: Recoverable;
  let box4Amount = 0;

  if (!isBusiness) {
    inputVatRecoverable = "No";
    box4Amount = 0;
    risks.push(
      "This is not flagged as a business expense, so the input VAT is not recoverable. If any part is for business use, apportion it and keep evidence."
    );
  } else if (!hasVatNumber) {
    inputVatRecoverable = "Review needed";
    box4Amount = 0;
    risks.push(
      "No UK VAT number is shown on the invoice. HMRC normally requires a valid VAT invoice to reclaim input VAT — request a proper VAT invoice before recovering this VAT."
    );
  } else if (vat === 0) {
    inputVatRecoverable = "Review needed";
    box4Amount = 0;
    risks.push(
      "There is no VAT to recover on this invoice. Confirm the correct treatment before posting."
    );
  } else if (looksLikeEntertainment) {
    inputVatRecoverable = "Review needed";
    box4Amount = 0;
    risks.push(
      "This looks like business/client entertainment. Input VAT on entertaining is generally NOT recoverable under UK VAT rules — do not reclaim it without confirming an exception (e.g. certain staff entertainment) applies."
    );
  } else {
    inputVatRecoverable = "Yes";
    box4Amount = round2(vat);
  }

  // --- 4. VAT return boxes -------------------------------------------------
  // Box 4 = VAT reclaimed on purchases (recoverable input VAT).
  // Box 7 = total value of purchases excluding VAT (the net amount).
  const box7Amount = round2(net);

  // --- 5. VAT return treatment narrative ----------------------------------
  let vatReturnTreatment: string;
  if (inputVatRecoverable === "Yes") {
    vatReturnTreatment = `Standard UK purchase. Include ${formatGBP(
      box4Amount
    )} in Box 4 (input VAT reclaimed) and ${formatGBP(
      box7Amount
    )} in Box 7 (net purchases).`;
  } else if (!isBusiness) {
    vatReturnTreatment = `Not a business purchase — exclude from the VAT return. Box 4: ${formatGBP(
      0
    )}. Net is shown in Box 7 only if it relates to the business.`;
  } else {
    vatReturnTreatment = `Include the net value of ${formatGBP(
      box7Amount
    )} in Box 7 (net purchases), but do not reclaim VAT in Box 4 until the treatment is confirmed.`;
  }

  // --- 6. Bookkeeping note -------------------------------------------------
  const category = input.expenseCategory?.trim() || "General expenses";
  const supplier = input.supplierName?.trim() || "the supplier";
  let bookkeepingNote: string;
  if (inputVatRecoverable === "Yes") {
    bookkeepingNote = `Post ${formatGBP(
      net
    )} to "${category}" and ${formatGBP(
      box4Amount
    )} to the VAT control account (input VAT). Total ${formatGBP(
      round2(net + vat)
    )} to ${supplier} (creditor/bank). VAT code: ${
      ratePercent === 20 ? "standard (20%)" : ratePercent === 5 ? "reduced (5%)" : "review"
    }.`;
  } else {
    bookkeepingNote = `Post the full ${formatGBP(
      gross > 0 ? gross : net + vat
    )} to "${category}" with no input VAT recovered (VAT code: no VAT / out of scope until reviewed). Supplier: ${supplier}.`;
  }

  // --- 7. Confidence -------------------------------------------------------
  let confidence: Confidence;
  if (
    inputVatRecoverable === "Yes" &&
    (ratePercent === 20 || ratePercent === 5) &&
    risks.length === 0
  ) {
    confidence = ratePercent === 20 ? "High" : "Medium";
  } else if (needsRateReview || !hasVatNumber || !isBusiness) {
    confidence = "Low";
  } else {
    confidence = "Medium";
  }

  const riskWarning =
    risks.length > 0
      ? risks.join(" ")
      : "No major risks detected. Always confirm against the original VAT invoice before filing.";

  return {
    likelyVatRate,
    ratePercent,
    inputVatRecoverable,
    vatReturnTreatment,
    box4Amount,
    box7Amount,
    bookkeepingNote,
    riskWarning,
    confidence,
  };
}

export function formatGBP(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number.isFinite(n) ? n : 0);
}
