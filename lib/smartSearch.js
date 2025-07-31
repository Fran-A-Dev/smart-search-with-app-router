export async function smartSearch(query) {
  const res = await fetch(process.env.NEXT_PUBLIC_SMART_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SMART_SEARCH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json;
}
