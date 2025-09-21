import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/courses", () => {
	let response;
	it("should return all courses", async () => {
		response = await request(server).get(`/api/v1/courses`).expect(200);
		expect(response.body).toHaveProperty("success",true);
	});
	
	it.skip("should return first course", async () => {
		if (response.body.data) {
			const courseOne = response.body.data[0].id;
			const response2 = await request(server).get(`/api/v1/courses/${courseOne}`).expect(200);
			expect(response2.body).toHaveProperty("data");
		}
	});
});