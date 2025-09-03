import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Page from "./page";

// Simple global fetch mock
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

	test("generate random number successfully", async () => {
		mockFetchOnce({ value: 7 });
		render(<Page />);
		fireEvent.click(screen.getByText("Generate"));
		await waitFor(() => expect(screen.getByText(/Result:/)).toBeInTheDocument());
		expect(screen.getByText(/Result:/).textContent).toContain("7");
	});

	test("get quote successfully", async () => {
		mockFetchOnce({ quote: "Test Quote" });
		render(<Page />);
		fireEvent.click(screen.getByText("Get Quote"));
		await waitFor(() => expect(screen.getByText(/Quote:/)).toBeInTheDocument());
		expect(screen.getByText(/Quote:/).textContent).toContain("Test Quote");
	});

	test("parameter error shown", async () => {
		(global as any).fetch = jest.fn().mockResolvedValueOnce({
			ok: false,
			text: async () => "min must be <= max",
		});
		render(<Page />);
		// set min > max
		fireEvent.change(screen.getByLabelText("min:"), { target: { value: "10" } });
		fireEvent.change(screen.getByLabelText("max:"), { target: { value: "1" } });
		fireEvent.click(screen.getByText("Generate"));
		await waitFor(() => expect(screen.getByText(/Error:/)).toBeInTheDocument());
		expect(screen.getByText(/Error:/).textContent).toContain("min must be <= max");
	});
});
