const http = require("http");
const https = require("https");

const getAssociationApiBaseUrl = () => {
  return process.env.ASSOCIATION_API_URL || "http://127.0.0.1:5001";
};

const requestJson = ({ path, payload }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getAssociationApiBaseUrl());
    const body = JSON.stringify(payload);
    const client = url.protocol === "https:" ? https : http;

    const req = client.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        timeout: Number(process.env.ASSOCIATION_API_TIMEOUT_MS || 10000)
      },
      (res) => {
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          let parsedBody = {};

          if (responseBody) {
            try {
              parsedBody = JSON.parse(responseBody);
            } catch (error) {
              const parseError = new Error("Association API returned an invalid JSON response");
              parseError.statusCode = 502;
              return reject(parseError);
            }
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const apiError = new Error(parsedBody.message || parsedBody.error || "Association API request failed");
            apiError.statusCode = res.statusCode;
            apiError.errors = parsedBody;
            return reject(apiError);
          }

          resolve(parsedBody);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Association API request timed out"));
    });

    req.on("error", (error) => {
      error.statusCode = error.statusCode || 502;
      reject(error);
    });

    req.write(body);
    req.end();
  });
};

const getAssociationRecommendations = async (payload) => {
  if (!Array.isArray(payload.items)) {
    const error = new Error("items must be an array");
    error.statusCode = 400;
    error.errors = { missing_fields: ["items"] };
    throw error;
  }

  return requestJson({
    path: "/recommend",
    payload: {
      items: payload.items
    }
  });
};

module.exports = {
  getAssociationRecommendations
};
