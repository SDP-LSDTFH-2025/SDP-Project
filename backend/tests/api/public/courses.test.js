import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/public/courses", () => {
	it.skip("should return courses", async () => {
		const response = await request(server)
			.get(`/api/v1/public/courses`)
			.expect(200);
		expect(response.body).toHaveProperty("success", true);
		expect(response.body).toHaveProperty("data");
	});
});
