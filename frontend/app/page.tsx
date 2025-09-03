"use client";

import { useMemo, useState } from "react";

interface GetRandomNumberRequest { min: number; max: number }
interface GetRandomNumberResponse { value: number }
interface GetRandomQuoteRequest {}
interface GetRandomQuoteResponse { quote: string }

function createClient(baseUrl: string) {
	return {
		getRandomNumber: async (req: GetRandomNumberRequest) => {
			const res = await fetch(`${baseUrl}/GetRandomNumber`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(req),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `HTTP ${res.status}`);
			}
			return (await res.json()) as GetRandomNumberResponse;
		},
		getRandomQuote: async (_req: GetRandomQuoteRequest) => {
			const res = await fetch(`${baseUrl}/GetRandomQuote`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `HTTP ${res.status}`);
			}
			return (await res.json()) as GetRandomQuoteResponse;
		},
	};
}

export default function Page() {
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
	const client = useMemo(() => createClient(baseUrl), [baseUrl]);

	const [min, setMin] = useState("1");
	const [max, setMax] = useState("10");
	const [numberResult, setNumberResult] = useState<string>("");
	const [numberError, setNumberError] = useState<string>("");
	const [loadingNumber, setLoadingNumber] = useState(false);

	const [quoteResult, setQuoteResult] = useState<string>("");
	const [quoteError, setQuoteError] = useState<string>("");
	const [loadingQuote, setLoadingQuote] = useState(false);

	const minNum = Number(min);
	const maxNum = Number(max);
	const canGenerate = !Number.isNaN(minNum) && !Number.isNaN(maxNum) && min.trim() !== "" && max.trim() !== "";

	async function onGenerateNumber() {
		if (!canGenerate) {
			setNumberError("Please enter valid numbers");
			return;
		}
		setNumberError("");
		setNumberResult("");
		setLoadingNumber(true);
		try {
			const res = await client.getRandomNumber({ min: minNum, max: maxNum });
			setNumberResult(String(res.value));
		} catch (e: any) {
			setNumberError(e?.message || "Request failed");
		} finally {
			setLoadingNumber(false);
		}
	}

	async function onGetQuote() {
		setQuoteError("");
		setQuoteResult("");
		setLoadingQuote(true);
		try {
			const res = await client.getRandomQuote({});
			setQuoteResult(res.quote);
		} catch (e: any) {
			setQuoteError(e?.message || "Request failed");
		} finally {
			setLoadingQuote(false);
		}
	}

	return (
		<div className="stack">
			<header className="header">
				<div className="brand">
					<div className="brand-badge">G</div>
					<span>Generator</span>
				</div>
				<span className="subtitle">Random Number & Random Quote</span>
			</header>

			<div className="grid">
				<section className="card stack">
					<h2 className="title">Random Number</h2>
					<p className="desc">Enter min and max to generate an integer in range</p>
					<div className="row">
						<input className="input" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" />
						<input className="input" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" />
					</div>
					<div className="actions">
						<button className="btn" onClick={onGenerateNumber} disabled={!canGenerate || loadingNumber}>{loadingNumber ? "Generating…" : "Generate"}</button>
						<span className="note">Example: 1 and 10</span>
					</div>
					{numberResult && <div className="good">Result: <span className="kpi">{numberResult}</span></div>}
					{numberError && <div className="alert">Error: {numberError}</div>}
					{!numberResult && !numberError && <div className="note">Enter a range and click Generate</div>}
				</section>

				<section className="card stack">
					<h2 className="title">Random Quote</h2>
					<p className="desc">Click the button to get a random preset quote</p>
					<div className="actions">
						<button className="btn" onClick={onGetQuote} disabled={loadingQuote}>{loadingQuote ? "Loading…" : "Get Quote"}</button>
					</div>
					{quoteResult && <div className="good">Quote: <span className="kpi">{quoteResult}</span></div>}
					{quoteError && <div className="alert">Error: {quoteError}</div>}
					{!quoteResult && !quoteError && <div className="note">Click the button to get a quote</div>}
				</section>
			</div>

			<footer className="footer">NEXT_PUBLIC_BACKEND_URL: {baseUrl}</footer>
		</div>
	);
}
