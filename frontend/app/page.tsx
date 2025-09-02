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
			setNumberError("请输入合法的数字");
			return;
		}
		setNumberError("");
		setNumberResult("");
		setLoadingNumber(true);
		try {
			const res = await client.getRandomNumber({ min: minNum, max: maxNum });
			setNumberResult(String(res.value));
		} catch (e: any) {
			setNumberError(e?.message || "请求失败");
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
			setQuoteError(e?.message || "请求失败");
		} finally {
			setLoadingQuote(false);
		}
	}

	return (
		<div className="stack">
			<header className="header">
				<div className="brand">
					<div className="brand-badge">G</div>
					<span>生成器</span>
				</div>
				<span className="subtitle">随机数与随机名言</span>
			</header>

			<div className="grid">
				<section className="card stack">
					<h2 className="title">随机数</h2>
					<p className="desc">输入最小值与最大值，生成一个区间内整数</p>
					<div className="row">
						<input className="input" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="最小值" />
						<input className="input" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="最大值" />
					</div>
					<div className="actions">
						<button className="btn" onClick={onGenerateNumber} disabled={!canGenerate || loadingNumber}>{loadingNumber ? "生成中…" : "生成"}</button>
						<span className="note">示例：1 与 10</span>
					</div>
					{numberResult && <div className="good">结果: <span className="kpi">{numberResult}</span></div>}
					{numberError && <div className="alert">错误: {numberError}</div>}
					{!numberResult && !numberError && <div className="note">输入范围并点击生成</div>}
				</section>

				<section className="card stack">
					<h2 className="title">随机名言</h2>
					<p className="desc">点击按钮，随机返回一条预设名言</p>
					<div className="actions">
						<button className="btn" onClick={onGetQuote} disabled={loadingQuote}>{loadingQuote ? "获取中…" : "获取名言"}</button>
					</div>
					{quoteResult && <div className="good">名言: <span className="kpi">{quoteResult}</span></div>}
					{quoteError && <div className="alert">错误: {quoteError}</div>}
					{!quoteResult && !quoteError && <div className="note">点击按钮获取一条名言</div>}
				</section>
			</div>

			<footer className="footer">NEXT_PUBLIC_BACKEND_URL: {baseUrl}</footer>
		</div>
	);
}
