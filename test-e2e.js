const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        ...headers,
      },
    };

    let payload = null;
    if (body) {
      if (typeof body === 'object' && !(body instanceof Buffer)) {
        payload = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
      } else {
        payload = body;
      }
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function parseCookies(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return '';
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function runTests() {
  console.log('--- STARTING PADHOORION END-TO-END VALIDATION (MODERATION & VERIFICATION) ---');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failures++;
    }
  }

  let createdUserIds = [];
  let createdResourceIds = [];
  let createdAnnId = null;
  let adminCookie = '';

  try {
    // 1. Landing Page & Public Active Announcements
    console.log('\n1. Testing Landing Page & Public Announcements...');
    const homeRes = await request('GET', '/');
    assert(homeRes.status === 200, 'Homepage renders with status 200');

    const annRes = await request('GET', '/api/announcements/active');
    assert(annRes.status === 200 && annRes.data.announcements.length >= 2, 'Active announcements endpoint returns announcements');

    // 2. Admin Authentication
    console.log('\n2. Testing Admin Login (Adhrit)...');
    const adminLogin = await request('POST', '/api/auth/login', {
      identifier: 'chopdekaradhrit2013@gmail.com',
      password: 'HALAMADRID123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', 'Admin login succeeds with credentials (role=ADMIN, grade=8th Grade)');
    adminCookie = parseCookies(adminLogin);

    // 3. Student Registration with 6-Digit Email Verification
    console.log('\n3. Testing Student Registration & Email Verification...');
    const testStudentName = `student_${Date.now().toString().slice(-4)}`;
    const studentEmail = `${testStudentName}@padhoorion.edu`;

    const regRes = await request('POST', '/api/auth/register', {
      username: testStudentName,
      email: studentEmail,
      password: 'StudentPass@123',
      confirmPassword: 'StudentPass@123',
      grade: '7th Grade',
    });
    assert(regRes.status === 201 && regRes.data.requiresVerification === true, 'Registration succeeds and requires email verification');
    assert(typeof regRes.data.verificationCode === 'string' && regRes.data.verificationCode.length === 6, 'Registration generates 6-digit numeric verification code');
    createdUserIds.push(regRes.data.user.id);

    const verificationCode = regRes.data.verificationCode;

    // 4. Login Attempt Prior to Verification is Blocked
    console.log('\n4. Testing Unverified Login Guard...');
    const unverifiedLogin = await request('POST', '/api/auth/login', {
      identifier: studentEmail,
      password: 'StudentPass@123',
    });
    assert(unverifiedLogin.status === 403 && unverifiedLogin.data.requiresVerification === true, 'Unverified student is blocked from logging in (403 requiresVerification)');

    // 5. Verification Endpoint Activates Account
    console.log('\n5. Testing 6-Digit Code Verification Endpoint...');
    // Incorrect code test
    const wrongCodeRes = await request('POST', '/api/auth/verify', {
      email: studentEmail,
      code: '000000',
    });
    assert(wrongCodeRes.status === 400, 'Invalid verification code is rejected (400)');

    // Correct code test
    const verifyRes = await request('POST', '/api/auth/verify', {
      email: studentEmail,
      code: verificationCode,
    });
    assert(verifyRes.status === 200 && verifyRes.data.success === true, 'Valid 6-digit verification code activates account');
    const verifiedStudentCookie = parseCookies(verifyRes);

    // 6. Login Now Succeeds After Verification
    console.log('\n6. Testing Post-Verification Login...');
    const verifiedLogin = await request('POST', '/api/auth/login', {
      identifier: studentEmail,
      password: 'StudentPass@123',
    });
    assert(verifiedLogin.status === 200 && verifiedLogin.data.user.isVerified === true, 'Student successfully logs in after verification');
    const studentCookie = parseCookies(verifiedLogin);

    // 7. Student Session & Warning Banner Check (Initial 0 warnings)
    const meRes = await request('GET', '/api/auth/me', null, { Cookie: studentCookie });
    assert(meRes.status === 200 && meRes.data.user.warningCount === 0, 'New student starts with warningCount = 0');

    // 8. Warning System: 1st Warning with Reason
    console.log('\n8. Testing Admin Moderation: Strike 1 Warning...');
    const warn1Res = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      action: 'warn',
      reason: 'Inappropriate language in notebook comment section',
    }, { Cookie: adminCookie });
    assert(warn1Res.status === 200 && warn1Res.data.warningCount === 1 && warn1Res.data.chancesRemaining === 2, 'Admin issues strike 1: warningCount=1, 2 chances remaining');

    // Verify student sees warning on /api/auth/me
    const meAfterWarn1 = await request('GET', '/api/auth/me', null, { Cookie: studentCookie });
    assert(meAfterWarn1.data.user.warningCount === 1 && meAfterWarn1.data.user.lastWarningReason.includes('Inappropriate language'), 'Student session immediately reflects warningCount=1 and exact warning reason');

    // 9. Warning System: 2nd Warning with Reason
    console.log('\n9. Testing Admin Moderation: Strike 2 Warning...');
    const warn2Res = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      action: 'warn',
      reason: 'Repeated disrespectful comment directed at classmate',
    }, { Cookie: adminCookie });
    assert(warn2Res.status === 200 && warn2Res.data.warningCount === 2 && warn2Res.data.chancesRemaining === 1, 'Admin issues strike 2: warningCount=2, 1 chance remaining');

    // 10. Warning System: 3rd Warning -> AUTOMATIC PERMANENT BAN
    console.log('\n10. Testing Admin Moderation: Strike 3 Automatic Ban & Email Blacklist...');
    const warn3Res = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      action: 'warn',
      reason: 'Spamming inappropriate images in notes',
    }, { Cookie: adminCookie });
    assert(warn3Res.status === 200 && warn3Res.data.autoBanned === true && warn3Res.data.warningCount === 3, 'Strike 3 triggers automatic permanent ban');

    // 11. Banned Student Blocked on Login with Exact Reason Displayed
    console.log('\n11. Testing Banned Login Rejection...');
    const bannedLoginRes = await request('POST', '/api/auth/login', {
      identifier: studentEmail,
      password: 'StudentPass@123',
    });
    assert(bannedLoginRes.status === 403 && bannedLoginRes.data.error.includes('automatically banned after 3 warnings'), 'Banned student is blocked from login (403) and receives exact ban reason');

    // 12. Banned Email Cannot Be Used to Register a New Account
    console.log('\n12. Testing Banned Email Registration Guard...');
    const reRegisterRes = await request('POST', '/api/auth/register', {
      username: `try_new_${Date.now().toString().slice(-4)}`,
      email: studentEmail,
      password: 'BrandNewPass@123',
      confirmPassword: 'BrandNewPass@123',
      grade: '8th Grade',
    });
    assert(reRegisterRes.status === 403 && reRegisterRes.data.error.includes('permanently banned'), 'Registration with banned email is rejected (403 permanently banned)');

    // 13. Admin Unban Student
    console.log('\n13. Testing Admin Unban Capability...');
    const unbanRes = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      action: 'unban',
    }, { Cookie: adminCookie });
    assert(unbanRes.status === 200 && unbanRes.data.user.isBanned === false && unbanRes.data.user.warningCount === 0, 'Admin unbans student: isBanned=false and warningCount reset to 0');

    // 14. Student Can Log In Again After Unban
    console.log('\n14. Testing Post-Unban Login...');
    const postUnbanLogin = await request('POST', '/api/auth/login', {
      identifier: studentEmail,
      password: 'StudentPass@123',
    });
    assert(postUnbanLogin.status === 200 && postUnbanLogin.data.user.isBanned === false, 'Unbanned student logs in successfully');

    // 15. Direct Ban with Short Reason Form
    console.log('\n15. Testing Admin Direct Ban with Reason...');
    const directBanRes = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      action: 'ban',
      reason: 'Severe violation of school conduct and community safety policy',
    }, { Cookie: adminCookie });
    assert(directBanRes.status === 200 && directBanRes.data.user.isBanned === true, 'Admin direct ban succeeds with custom reason');

    const directBannedLogin = await request('POST', '/api/auth/login', {
      identifier: studentEmail,
      password: 'StudentPass@123',
    });
    assert(directBannedLogin.status === 403 && directBannedLogin.data.error.includes('Severe violation of school conduct'), 'Login shows direct ban reason to student');

    console.log('\n--- ALL TEST SUITES COMPLETED ---');
    if (failures === 0) {
      console.log('SUCCESS: All automated end-to-end tests for moderation and email verification passed cleanly with 0 failures!');
    } else {
      console.error(`FAILURE: ${failures} tests failed.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    // Cleanup of all test artifacts
    try {
      if (createdAnnId && adminCookie) {
        await request('DELETE', `/api/admin/announcements?id=${createdAnnId}`, null, { Cookie: adminCookie });
      }
      const { PrismaClient } = require('@prisma/client');
      const p = new PrismaClient();
      if (createdResourceIds.length > 0) {
        await p.comment.deleteMany({ where: { resourceId: { in: createdResourceIds } } });
        await p.like.deleteMany({ where: { resourceId: { in: createdResourceIds } } });
        await p.bookmark.deleteMany({ where: { resourceId: { in: createdResourceIds } } });
        await p.resource.deleteMany({ where: { id: { in: createdResourceIds } } });
      }
      if (createdUserIds.length > 0) {
        const testEmails = (await p.user.findMany({ where: { id: { in: createdUserIds } }, select: { email: true } })).map(u => u.email);
        await p.bannedEmail.deleteMany({ where: { email: { in: testEmails } } });
        await p.comment.deleteMany({ where: { authorId: { in: createdUserIds } } });
        await p.notification.deleteMany({ where: { OR: [{ userId: { in: createdUserIds } }, { actorId: { in: createdUserIds } }] } });
        await p.activity.deleteMany({ where: { userId: { in: createdUserIds } } });
        await p.like.deleteMany({ where: { userId: { in: createdUserIds } } });
        await p.bookmark.deleteMany({ where: { userId: { in: createdUserIds } } });
        await p.resource.deleteMany({ where: { authorId: { in: createdUserIds } } });
        await p.user.deleteMany({ where: { id: { in: createdUserIds } } });
      }
      await p.$disconnect();
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
}

runTests();
