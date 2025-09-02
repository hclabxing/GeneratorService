import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Page from "./page";

// 简单全局 fetch mock
function mockFetchOnce(data: any, ok = true) {
	(global as any).fetch = jest.fn().mockResolvedValueOnce({
		ok,
		json: async () => data,
		text: async () => JSON.stringify(data),
	});
}

describe("Page interactions", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	test("生成随机数成功", async () => {
		mockFetchOnce({ value: 7 });
		render(<Page />);
		fireEvent.click(screen.getByText("生成"));
		await waitFor(() => expect(screen.getByText(/结果:/)).toBeInTheDocument());
		expect(screen.getByText(/结果:/).textContent).toContain("7");
	});

	test("获取名言成功", async () => {
		mockFetchOnce({ quote: "Test Quote" });
		render(<Page />);
		fireEvent.click(screen.getByText("获取名言"));
		await waitFor(() => expect(screen.getByText(/名言:/)).toBeInTheDocument());
		expect(screen.getByText(/名言:/).textContent).toContain("Test Quote");
	});

	test("参数错误显示", async () => {
		(global as any).fetch = jest.fn().mockResolvedValueOnce({
			ok: false,
			text: async () => "min must be <= max",
		});
		render(<Page />);
		// 设置 min > max
		fireEvent.change(screen.getByLabelText("min:"), { target: { value: "10" } });
		fireEvent.change(screen.getByLabelText("max:"), { target: { value: "1" } });
		fireEvent.click(screen.getByText("生成"));
		await waitFor(() => expect(screen.getByText(/错误:/)).toBeInTheDocument());
		expect(screen.getByText(/错误:/).textContent).toContain("min must be <= max");
	});
});
