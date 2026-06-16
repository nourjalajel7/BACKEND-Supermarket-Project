const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
};

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const productsToCsv = (products) => {
  const headers = [
    "product_id", "category", "product_name", "image_url", "barcode",
    "price_jd", "stock_quantity", "minimum_stock", "health_tags", "supplier_id"
  ];
  const rows = products.map((product) => [
    product._id,
    product.categoryName || product.category,
    product.name,
    product.imageUrl,
    product.barcode,
    product.price,
    product.quantity,
    product.minimumStock,
    (product.healthTags || []).join(","),
    product.supplier?._id || product.supplier || ""
  ].map(escapeCsv).join(","));
  return [headers.join(","), ...rows].join("\n");
};

module.exports = { parseCsv, productsToCsv };
