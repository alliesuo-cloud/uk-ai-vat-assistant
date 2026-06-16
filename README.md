# AI VAT Assistant

A clean, professional web app that helps **junior accountants analyse UK purchase invoices for VAT treatment**. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

> ⚠️ **This is an AI-assisted VAT guide, not professional tax advice.**

## Features

- Professional homepage with an invoice input form:
  - Supplier name, invoice description
  - Net / VAT / Gross amounts
  - UK VAT number shown? (Yes/No)
  - Business expense? (Yes/No)
  - Expense category
- **Analyse VAT Treatment** button producing an output card with:
  - Likely VAT rate
  - Input VAT recoverable? (Yes / No / Review needed)
  - VAT return treatment
  - **Box 4** (recoverable input VAT) and **Box 7** (net purchases)
  - Bookkeeping note
  - Risk warning
  - Confidence level
- One-click **sample invoices**: Amazon office supplies, train ticket, client meal, software subscription.

## VAT logic (rules)

The analysis lives in [`lib/vat.ts`](lib/vat.ts):

- VAT ≈ **20%** of net → **standard-rated (20%)**
- VAT ≈ **5%** of net → **reduced-rated (5%)**
- VAT = **0** → **zero-rated / exempt / no VAT** → review needed
- **No UK VAT number** → warn input VAT may not be recoverable
- **Not a business expense** → input VAT not recoverable
- **Box 4** = recoverable input VAT, **Box 7** = net purchase value

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no extra configuration needed. Click **Deploy**.

Or via CLI:

```bash
npm i -g vercel
vercel
```
