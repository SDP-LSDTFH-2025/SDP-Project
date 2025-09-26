import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe.skip("GET /api/v1/notifications", () => {
	let response;
	it("should return all notification", async () => {
		response = await request(server).get(`/api/v1/notifications/all`).expect(200);
		expect(response.body).toHaveProperty("success",true);
	});
	
});