import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
	// Check that the footer renders the current year and copyright text
	it("renders the current year and copyright text", () => {
		render(<Footer />);
		const year = new Date().getFullYear().toString();
		expect(
			// Check that the footer contains the current year and copyright text
			screen.getByText(`© ${year} PhishingMail AI. All rights reserved.`),
		).toBeInTheDocument();
	});
});
