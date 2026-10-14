const API_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("===============================================================");
  console.log("       SKY WARDENS SECURITY & AUTHENTICATION TEST SUITE        ");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = "") {
    if (condition) {
      console.log(`[PASS] ${title} ${extra}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${extra}`);
      failed++;
    }
  }

  let authToken = "";

  // TEST 1: Happy Path Login with Super Admin credentials
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@skywardens.com",
        password: "SuperAdmin@Sky2026#",
      }),
    });
    const data = await res.json();
    authToken = data.token;
    assert(
      "1. Happy Path: Super Admin Login",
      res.status === 200 && data.success === true && !!data.token && data.user.role === "Super Admin",
      `-> Status: ${res.status}, Role: ${data.user?.role}`
    );
  } catch (e) {
    assert("1. Happy Path: Super Admin Login", false, `-> Error: ${e.message}`);
  }

  // TEST 2: Authenticated Profile (GET /api/auth/me with valid Bearer token)
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    assert(
      "2. Protected Profile: GET /api/auth/me with valid Bearer token",
      res.status === 200 && data.success === true && data.user.email === "admin@skywardens.com",
      `-> Status: ${res.status}, User: ${data.user?.email}`
    );
  } catch (e) {
    assert("2. Protected Profile", false, `-> Error: ${e.message}`);
  }

  // TEST 3: Validation Failure (Missing password and invalid email format)
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
      }),
    });
    const data = await res.json();
    assert(
      "3. Input Validation: Missing password & bad email rejected by Zod",
      res.status === 400 && data.success === false && data.message.includes("validation"),
      `-> Status: ${res.status}, Message: ${data.message}`
    );
  } catch (e) {
    assert("3. Input Validation", false, `-> Error: ${e.message}`);
  }

  // TEST 4: Mass Assignment / Unknown Fields Rejection (Strict Schema)
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@skywardens.com",
        password: "SuperAdmin@Sky2026#",
        injectedRole: "HackerRole",
        isAdmin: true,
      }),
    });
    const data = await res.json();
    assert(
      "4. Mass Assignment / Strict Schema: Unknown injected fields rejected",
      res.status === 400 && data.success === false,
      `-> Status: ${res.status}, Errors: ${JSON.stringify(data.errors || data.message)}`
    );
  } catch (e) {
    assert("4. Strict Schema", false, `-> Error: ${e.message}`);
  }

  // TEST 5: NoSQL Injection Payload Attack
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: { $gt: "" },
        password: "SuperAdmin@Sky2026#",
      }),
    });
    const data = await res.json();
    assert(
      "5. NoSQL Injection Protection: Object payload in string field rejected",
      res.status === 400 && data.success === false,
      `-> Status: ${res.status}, Response: ${data.message}`
    );
  } catch (e) {
    assert("5. NoSQL Injection", false, `-> Error: ${e.message}`);
  }

  // TEST 6: Unauthorized Request (No Token)
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
    });
    const data = await res.json();
    assert(
      "6. Unauthorized: GET /api/auth/me rejected without Bearer token",
      res.status === 401 && data.success === false,
      `-> Status: ${res.status}, Message: ${data.message}`
    );
  } catch (e) {
    assert("6. Unauthorized", false, `-> Error: ${e.message}`);
  }

  // TEST 7: Invalid / Tampered Token
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: "Bearer fake_or_tampered_jwt_token_defense_12345",
      },
    });
    const data = await res.json();
    assert(
      "7. Invalid Token: Tampered token rejected by JWT verification",
      res.status === 401 && data.success === false,
      `-> Status: ${res.status}, Message: ${data.message}`
    );
  } catch (e) {
    assert("7. Invalid Token", false, `-> Error: ${e.message}`);
  }

  // TEST 8: Invalid Password (Generic error message verification)
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@skywardens.com",
        password: "WrongPassword@2026!",
      }),
    });
    const data = await res.json();
    assert(
      "8. Generic Error: Wrong password returns 401 'Invalid credentials.'",
      res.status === 401 && data.success === false && data.message === "Invalid credentials.",
      `-> Status: ${res.status}, Message: ${data.message}`
    );
  } catch (e) {
    assert("8. Generic Error", false, `-> Error: ${e.message}`);
  }

  // TEST 9: Non-existent User (No Account Enumeration)
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent.user@skywardens.com",
        password: "SomePassword@123",
      }),
    });
    const data = await res.json();
    assert(
      "9. Account Enumeration Defense: Non-existent email also returns 'Invalid credentials.'",
      res.status === 401 && data.success === false && data.message === "Invalid credentials.",
      `-> Status: ${res.status}, Message: ${data.message}`
    );
  } catch (e) {
    assert("9. Account Enumeration", false, `-> Error: ${e.message}`);
  }

  // TEST 10: Server-Side RBAC Check on Protected Admin Route
  try {
    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    assert(
      "10. Server-Side RBAC: Super Admin clearance authorized to access /api/users",
      res.status === 200 && data.success === true && Array.isArray(data.users) && data.users.length === 1,
      `-> Status: ${res.status}, Users Count: ${data.count}, Role: ${data.users[0]?.role}`
    );
  } catch (e) {
    assert("10. Server-Side RBAC", false, `-> Error: ${e.message}`);
  }

  console.log("\n===============================================================");
  console.log(` TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
