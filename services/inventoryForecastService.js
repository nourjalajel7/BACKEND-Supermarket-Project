const http = require("http");
const https = require("https");

const FEATURES = [
  "ID",
  "Product",
  "Category",
  "Year",
  "Month_Num",
  "Week_Num",
  "Time_Index",
  "Sales",
  "Sales_Lag_1",
  "Sales_Lag_4",
  "Sales_Rolling_4",
  "Sales_Rolling_12"
];

const REQUIRED_STOCK_FORECAST_FIELDS = [...FEATURES, "Current_Stock", "Safety_Stock"];

const getForecastApiBaseUrl = () => {
  return process.env.INVENTORY_FORECAST_API_URL || process.env.ASSOCIATION_API_URL || "http://127.0.0.1:5001";
};

const requestJson = ({ path, payload }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getForecastApiBaseUrl());
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
        timeout: Number(process.env.INVENTORY_FORECAST_API_TIMEOUT_MS || 10000)
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
              const parseError = new Error("Forecast API returned an invalid JSON response");
              parseError.statusCode = 502;
              return reject(parseError);
            }
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const apiError = new Error(parsedBody.message || parsedBody.error || "Forecast API request failed");
            apiError.statusCode = res.statusCode;
            apiError.errors = parsedBody;
            return reject(apiError);
          }

          resolve(parsedBody);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Forecast API request timed out"));
    });

    req.on("error", (error) => {
      error.statusCode = error.statusCode || 502;
      reject(error);
    });

    req.write(body);
    req.end();
  });
};

const predictStockWithForecastApi = async (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    const error = new Error("Prediction payload must be a JSON object");
    error.statusCode = 400;
    error.errors = { expected_body: "object" };
    throw error;
  }

  return requestJson({
    path: "/api/predict",
    payload
  });
};

module.exports = {
  REQUIRED_STOCK_FORECAST_FIELDS,
  predictStockWithForecastApi
};
