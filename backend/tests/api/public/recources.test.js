import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/public/pdf", () => {
	it("should return resource", async () => {
		const response = await request(server).get(`/api/v1/public/pdf`)
		expect(response.body).toHaveProperty("success", false);
	});
});
