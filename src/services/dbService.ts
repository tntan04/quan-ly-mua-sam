export async function getRequests() {
  const res = await fetch("/api/requests");
  return await res.json();
}

export async function createRequest(data: any) {
  const res = await fetch("/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}
