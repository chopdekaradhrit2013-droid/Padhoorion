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
  console.log('--- STARTING PADHOORION END-TO-END VALIDATION ---');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failures++;
    }
  }

  try {
    // 1. Homepage & Announcements
    console.log('\nTesting Homepage & Active Announcements...');
    const homeRes = await request('GET', '/');
    assert(homeRes.status === 200, 'Homepage renders with status 200 (Landing Page for visitors)');

    const annRes = await request('GET', '/api/announcements/active');
    assert(annRes.status === 200 && annRes.data.announcements.length >= 2, 'Active announcements endpoint returns announcements');

    // Test Unauthenticated Auth Wall
    console.log('\nTesting Unauthenticated Access Control (Auth Wall)...');
    const unauthPageRes = await request('GET', '/grades');
    assert(unauthPageRes.status === 307 || unauthPageRes.status === 302, 'Unauthenticated visitor to /grades is redirected to /login');

    const unauthApiRes = await request('GET', '/api/resources');
    assert(unauthApiRes.status === 401, 'Unauthenticated API access to /api/resources returns 401 Unauthorized');

    // 2. Student Authentication (Adhrit 7th Grade)
    console.log('\nTesting Authentication & Sessions...');
    const loginRes = await request('POST', '/api/auth/login', {
      identifier: 'Adhrit',
      password: 'Student@123',
    });
    assert(loginRes.status === 200 && loginRes.data.user.username === 'Adhrit', 'Student login succeeds');
    assert(loginRes.data.user.grade.includes('Grade'), 'Student grade is a valid Grade tag');

    const studentCookie = parseCookies(loginRes);

    // Verify /api/auth/me with session cookie
    const meRes = await request('GET', '/api/auth/me', null, { Cookie: studentCookie });
    assert(meRes.status === 200 && meRes.data.user.username === 'Adhrit', 'Session cookie maintains logged-in state');

    // 3. User Registration
    console.log('\nTesting Public Registration...');
    const testUsername = `student_${Date.now().toString().slice(-4)}`;
    const regRes = await request('POST', '/api/auth/register', {
      username: testUsername,
      email: `${testUsername}@padhoorion.edu`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      grade: '8th Grade',
    });
    assert(regRes.status === 201 && regRes.data.user.username === testUsername, 'New student public registration succeeds');
    const newStudentCookie = parseCookies(regRes);

    // 4. Email Verification
    console.log('\nTesting Email Verification...');
    const verifyRes = await request('POST', '/api/auth/verify', {}, { Cookie: newStudentCookie });
    assert(verifyRes.status === 200 && verifyRes.data.success === true, 'Email verification succeeds');

    // 5. Grade Exploration (Access across all 5 grades)
    console.log('\nTesting Grade Access & Categories...');
    const grades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade'];
    for (const g of grades) {
      const gRes = await request('GET', `/api/resources?grade=${encodeURIComponent(g)}`, null, { Cookie: studentCookie });
      assert(gRes.status === 200, `Grade exploration succeeds for ${g}`);
    }

    // 6. Resources List & Search
    console.log('\nTesting Resource Discovery & Social Features...');
    const searchRes = await request('GET', '/api/resources?search=Linear', null, { Cookie: studentCookie });
    assert(searchRes.status === 200 && searchRes.data.resources.length > 0, 'Resource search returns matching resources');

    const firstResource = searchRes.data.resources[0];
    const resourceId = firstResource.id;

    // 7. Resource Details
    const detailRes = await request('GET', `/api/resources/${resourceId}`, null, { Cookie: studentCookie });
    assert(detailRes.status === 200 && detailRes.data.resource.title.includes('Linear'), 'Resource details page returns resource');
    assert(detailRes.data.resource.authorGradeAtPublish === '7th Grade', 'Resource retains author grade at publish time');

    // 8. Like & Bookmark & Download
    console.log('\nTesting Like, Bookmark, and Download tracking...');
    const likeRes = await request('POST', `/api/resources/${resourceId}/like`, {}, { Cookie: newStudentCookie });
    assert(likeRes.status === 200, 'Like toggle succeeds');

    const bookmarkRes = await request('POST', `/api/resources/${resourceId}/bookmark`, {}, { Cookie: newStudentCookie });
    assert(bookmarkRes.status === 200 && bookmarkRes.data.bookmarked === true, 'Bookmark toggle succeeds');

    const downloadRes = await request('POST', `/api/resources/${resourceId}/download`, {}, { Cookie: studentCookie });
    assert(downloadRes.status === 200 && downloadRes.data.downloadsCount > 0, 'Download increment succeeds');

    // 9. Comments & Threaded Replies
    console.log('\nTesting Comments & Threaded Replies...');
    const commentRes = await request('POST', '/api/comments', {
      resourceId,
      content: 'Can you upload part 2 of the coordinate geometry diagrams please?',
    }, { Cookie: newStudentCookie });
    assert(commentRes.status === 201 && commentRes.data.comment.authorGradeAtPublish === '8th Grade', 'Comment posted with current grade snapshot [8th Grade]');

    const commentId = commentRes.data.comment.id;

    // Reply to comment
    const replyRes = await request('POST', '/api/comments', {
      resourceId,
      parentId: commentId,
      content: 'Sure, I will share part 2 tomorrow evening!',
    }, { Cookie: studentCookie });
    assert(replyRes.status === 201 && replyRes.data.comment.parentId === commentId, 'Threaded reply posted successfully');

    // 10. Grade Progression Test (Requirement 8)
    console.log('\nTesting Academic Grade Progression...');
    // Adhrit promotes from 7th Grade to 8th Grade
    const progRes = await request('POST', '/api/users/update-grade', {
      newGrade: '8th Grade',
    }, { Cookie: studentCookie });
    assert(progRes.status === 200 && progRes.data.user.grade === '8th Grade', 'Academic Grade Progression succeeds: promoted to 8th Grade');

    // Verify historical snapshot on previous resource remains intact
    const historicalRes = await request('GET', `/api/resources/${resourceId}`, null, { Cookie: studentCookie });
    assert(historicalRes.data.resource.authorGradeAtPublish === '7th Grade', 'Historical resource preserves 7th Grade snapshot');
    assert(historicalRes.data.resource.author.grade === '8th Grade', 'Author profile reflects updated current grade 8th Grade');

    // 11. Public User Profile
    console.log('\nTesting Public User Profile...');
    const profileRes = await request('GET', `/api/users/profile?username=Adhrit`, null, { Cookie: studentCookie });
    assert(profileRes.status === 200 && profileRes.data.user.username === 'Adhrit', 'Public user profile returns user data');
    assert(profileRes.data.user.grade === '8th Grade', 'Public profile displays live grade tag');
    assert(profileRes.data.user.activities.some((a) => a.type === 'GRADE_CHANGE'), 'Activity history records academic grade progression');

    // 12. Admin Features (Requirement 10)
    console.log('\nTesting Admin Console & Security...');
    const adminLogin = await request('POST', '/api/auth/login', {
      identifier: 'principal_orion',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', 'Admin login succeeds');
    const adminCookie = parseCookies(adminLogin);

    // Verify student cannot access admin overview
    const studentForbidden = await request('GET', '/api/admin/overview', null, { Cookie: studentCookie });
    assert(studentForbidden.status === 403, 'Backend authorization blocks non-admins from admin overview (403)');

    // Admin overview
    const adminOverview = await request('GET', '/api/admin/overview', null, { Cookie: adminCookie });
    assert(adminOverview.status === 200 && adminOverview.data.stats.totalUsers >= 5, 'Admin overview returns system metrics');

    // Create Announcement with duration option (Requirement 10)
    const newAnn = await request('POST', '/api/admin/announcements', {
      title: 'Annual Science Fair Projects Due Monday',
      content: 'Students from 6th to 10th grades submit your project summaries and experiment worksheets.',
      priority: 'HIGH',
      durationOption: '24_HOURS',
    }, { Cookie: adminCookie });
    assert(newAnn.status === 201 && newAnn.data.announcement.durationOption === '24_HOURS', 'Admin successfully creates announcement with 24_HOURS duration');

    // Ban and unban user test
    const banRes = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      ban: true,
    }, { Cookie: adminCookie });
    assert(banRes.status === 200 && banRes.data.user.isBanned === true, 'Admin successfully bans violating user');

    const bannedLogin = await request('POST', '/api/auth/login', {
      identifier: testUsername,
      password: 'Password@123',
    });
    assert(bannedLogin.status === 403, 'Banned user is blocked from logging in (403)');

    // Unban user
    const unbanRes = await request('POST', '/api/admin/users', {
      targetUserId: regRes.data.user.id,
      ban: false,
    }, { Cookie: adminCookie });
    assert(unbanRes.status === 200 && unbanRes.data.user.isBanned === false, 'Admin successfully unbans user');

    // Notifications check
    const notifRes = await request('GET', '/api/notifications', null, { Cookie: studentCookie });
    assert(notifRes.status === 200 && notifRes.data.notifications.length > 0, 'Notifications system receives notifications');

    // Admin Impersonation (Login As Student) Test
    console.log('\nTesting Admin Test Access (Impersonation & Password Reset)...');
    const impersonateRes = await request('POST', '/api/admin/impersonate', {
      targetUserId: regRes.data.user.id,
    }, { Cookie: adminCookie });
    assert(impersonateRes.status === 200 && impersonateRes.data.success === true, 'Admin successfully initiates test session into student account');
    const impersonateCookie = parseCookies(impersonateRes);

    const impersonatedMe = await request('GET', '/api/auth/me', null, { Cookie: impersonateCookie });
    assert(impersonatedMe.status === 200 && impersonatedMe.data.user.username === testUsername && impersonatedMe.data.user.impersonatedBy, 'Session reflects student identity with active admin impersonation tracking');

    // Exit Impersonation Test
    const exitImpersonateRes = await request('POST', '/api/admin/impersonate/exit', null, { Cookie: impersonateCookie });
    assert(exitImpersonateRes.status === 200 && exitImpersonateRes.data.success === true, 'Admin successfully exits test session');
    const restoredAdminCookie = parseCookies(exitImpersonateRes);

    const restoredMe = await request('GET', '/api/auth/me', null, { Cookie: restoredAdminCookie });
    assert(restoredMe.status === 200 && restoredMe.data.user.role === 'ADMIN', 'Session is safely restored to administrator');

    // Admin Password Reset Test
    const resetRes = await request('POST', '/api/admin/users/reset-password', {
      targetUserId: regRes.data.user.id,
      newPassword: 'NewAssignedTestPass@2026',
    }, { Cookie: adminCookie });
    assert(resetRes.status === 200 && resetRes.data.success === true, 'Admin successfully overrides/resets student test password');

    const testLoginWithNewPass = await request('POST', '/api/auth/login', {
      identifier: testUsername,
      password: 'NewAssignedTestPass@2026',
    });
    assert(testLoginWithNewPass.status === 200, 'Student logs in successfully using newly assigned test password');

    console.log('\n--- ALL TEST SUITES COMPLETED ---');
    if (failures === 0) {
      console.log('SUCCESS: All 22 automated end-to-end tests passed cleanly with 0 failures!');
    } else {
      console.error(`FAILURE: ${failures} tests failed.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();

