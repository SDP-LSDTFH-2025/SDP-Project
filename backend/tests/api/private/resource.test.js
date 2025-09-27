import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/resources", () => {
	
	const getFirstResourceId = async () => {
		const response = await request(server)
			.get(`/api/v1/resources/all`)
			.expect(200);
		return response.body?.data?.[0]?.id;
	};

	let response;
	it("should return all resources", async () => {
		response = await request(server).get(`/api/v1/resources/all`).expect(200);
		expect(response.body).toHaveProperty("success", true);
	});

	it.skip("should return first resources", async () => {
		if (response.body && response.body.data && response.body.data.length > 0) {
			const resourceOne = response.body.data[0].id;
			const response2 = await request(server)
				.get(`/api/v1/resources/${resourceOne}`)
				.expect(200);
			expect(response2.body).toHaveProperty("data");
		}
	});
});
