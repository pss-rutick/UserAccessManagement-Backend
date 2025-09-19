import admin, { db } from "../firebase";

function parseEmailsArg(): string[] {
  const argIdx = process.argv.findIndex((a) => a === "--emails");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return process.argv[argIdx + 1]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

async function ensureAdminByEmail(email: string) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    if (!db) throw new Error("Firebase is not configured");
    await db.collection("userRoles").doc(user.uid).set({
      role: "admin",
      updatedAt: new Date(),
      updatedBy: "script:setAdmin",
    }, { merge: true });
    await db.collection("adminProfiles").doc(user.uid).set({
      uid: user.uid,
      email: user.email || email,
      updatedAt: new Date(),
      updatedBy: "script:setAdmin",
    }, { merge: true });
    console.log(`✅ Admin role granted: ${email} (${user.uid})`);
  } catch (error: any) {
    console.error(`❌ Failed for ${email}:`, error?.message || error);
  }
}

async function main() {
  const envEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const cliEmails = parseEmailsArg();
  const emails = [...new Set([...envEmails, ...cliEmails])];

  if (emails.length === 0) {
    console.error("Provide admin emails via --emails a@b.com,c@d.com or ADMIN_EMAILS env.");
    process.exit(1);
  }

  for (const email of emails) {
    // eslint-disable-next-line no-await-in-loop
    await ensureAdminByEmail(email);
  }
}

main();
