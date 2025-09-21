import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../server";

describe("GET /api/v1", () => {
	it("should return API INFO", async () => {
		const response = await request(server).get(`/api/v1`).expect(200);
		expect(response.body).toHaveProperty("message", "SDP Project API");
    
	});
});
