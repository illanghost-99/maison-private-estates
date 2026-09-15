export function pushToCrm(person: {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  message?: string;
  flag?: string;
  source?: string;
  type?: string;
}) {
  if (typeof window === "undefined") return;
  const hot = person.flag === "hot" || person.flag === "✅";
  const intent =
    (person.type || person.message || "").toLowerCase().includes("sälj")
      ? "sälja"
      : (person.type || person.message || "").toLowerCase().includes("köp")
        ? "köpa"
        : hot
          ? "köpa"
          : "okänt";
  const row = {
    id: "web-" + Date.now(),
    firstName: person.firstName,
    lastName: person.lastName || "",
    phone: person.phone,
    email: person.email || "",
    stage: "ny" as const,
    intent,
    score: hot ? 90 : 60,
    area: "Webb / chatt",
    lastTouch: "Nu",
    nextStep: hot ? "Ring omedelbart" : "Ring vid tillfälle",
    notes: person.message || person.type || "",
    source: person.source || "Hemsidan",
    flag: hot ? "✅" : "📳",
  };
  try {
    const crm = JSON.parse(localStorage.getItem("maison_crm") || "[]");
    crm.unshift(row);
    localStorage.setItem("maison_crm", JSON.stringify(crm.slice(0, 80)));
    const inbox = JSON.parse(localStorage.getItem("maison_inbox") || "[]");
    inbox.unshift({
      id: row.id,
      name: row.firstName + " " + row.lastName,
      email: row.email,
      phone: row.phone,
      message: row.notes,
      score: row.score,
      serious: hot,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("maison_inbox", JSON.stringify(inbox.slice(0, 50)));
  } catch {}
}
