# Comprehensive Test Suite Documentation
## FC Real Bengaluru - RealVerse Website

### Overview
This comprehensive test suite ensures all sections of the website, including RealVerse sections, are working correctly and are accessible across desktop, mobile, tablet, and other important devices.

### Test Coverage

#### 1. **Responsive UI Tests** (`responsive-ui.spec.ts`)
- Tests all public pages across different device sizes
- Verifies viewport fit and no horizontal overflow
- Checks mobile menu functionality
- Tests responsive layouts for:
  - Landing page
  - Shop page
  - Brochure page
  - Programs pages
  - RealVerse Experience page
  - Fan Club Benefits page
  - All RealVerse sections (Student, Coach, Admin, Fan)

#### 2. **RealVerse Comprehensive Tests** (`realverse-comprehensive.spec.ts`)
- **Student Section:**
  - Dashboard
  - Development page
  - Analytics page
  - Matches page
  - Wellness Reports
  - Schedule
  - Attendance
  - Fixtures
  - Drills
  - Feed
  - Leaderboard

- **Coach Section:**
  - Dashboard
  - Analytics
  - Schedule
  - Fan Club Analytics

- **Admin Section:**
  - Dashboard
  - Analytics
  - Students management
  - Centres management
  - Merchandise management
  - Attendance management
  - Schedule management
  - Fan management (tiers, rewards, analytics)
  - Season planning
  - Batch review
  - Scouting board

- **Fan Section:**
  - Dashboard
  - Benefits
  - Games
  - Matchday
  - Profile
  - Programs

#### 3. **Public Pages Comprehensive Tests** (`public-pages-comprehensive.spec.ts`)
- Landing page
- About page
- Teams page
- Shop pages (list and detail)
- Cart page
- Brochure pages (interactive and classic)
- RealVerse Experience page
- Programs pages (all variants)
- Fan Club pages
- Login page
- Navigation and CTAs
- Performance tests
- Error handling

#### 4. **Build Verification Tests** (`build-verification.spec.ts`)
- Build completion verification
- Critical assets loading
- JavaScript bundle loading
- CSS loading
- Image loading
- Font loading
- Internal link validation
- Performance metrics
- SEO structure
- Basic accessibility structure

#### 5. **Accessibility and UI Tests** (`accessibility-ui.spec.ts`)
- Keyboard navigation
- ARIA labels and roles
- Form element accessibility
- Layout and spacing
- Interactive elements
- Responsive behavior
- Loading states

#### 6. **Visual Layout Tests** (`visual-layout.spec.ts`)
- Layout consistency
- Content width and overflow
- Text alignment
- Spacing consistency
- Responsive breakpoints (mobile, tablet, desktop, large desktop)
- RealVerse section layouts
- Component alignment

### Device Coverage

The test suite runs on the following device configurations:

#### Desktop Browsers
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

#### Tablet Devices
- iPad Pro (portrait and landscape)
- Various tablet viewports

#### Mobile Devices
- iPhone 13 (portrait and landscape)
- iPhone SE (small mobile)
- Pixel 5 (Android, portrait and landscape)
- Various mobile viewports

### Running the Tests

#### Run All Tests
```bash
cd frontend
npm run test:e2e
```

#### Run Tests in UI Mode
```bash
npm run test:e2e:ui
```

#### Run Tests in Headed Mode
```bash
npm run test:e2e:headed
```

#### Run Specific Test File
```bash
npx playwright test tests/e2e/responsive-ui.spec.ts
```

#### Run Tests on Specific Device
```bash
npx playwright test --project=chromium-mobile
```

### Test Credentials

The tests use the following test credentials (should be seeded in test database):

- **Student:** `student@test.com` / `test123`
- **Coach:** `coach@test.com` / `test123`
- **Admin:** `admin@test.com` / `test123`
- **Fan:** `fan@test.com` / `test123`

### Test Results

Test results are generated in:
- `playwright-report/` - HTML report
- `test-results/` - Screenshots and test artifacts
- `test-results.json` - JSON test results

### Key Test Features

1. **Comprehensive Coverage:** Tests all major sections and pages
2. **Multi-Device Testing:** Tests across desktop, tablet, and mobile
3. **Responsive Design:** Verifies layouts adapt correctly to different screen sizes
4. **Accessibility:** Checks keyboard navigation, ARIA labels, and semantic HTML
5. **Performance:** Validates page load times and performance metrics
6. **Error Handling:** Tests error states and edge cases
7. **Visual Consistency:** Verifies layout consistency across devices
8. **Build Verification:** Ensures build process works correctly

### Continuous Integration

The test suite is configured to:
- Run in parallel when possible
- Retry failed tests in CI (2 retries)
- Generate HTML reports
- Capture screenshots on failure
- Record videos on failure
- Generate trace files for debugging

### Maintenance

- Update test credentials if database changes
- Add new test cases when new features are added
- Update device configurations as needed
- Review and update selectors if UI changes significantly

### Notes

- Some tests may require the backend to be running
- Test data should be seeded in the test database
- Some tests check for optional elements and may pass even if elements don't exist
- Screenshots are taken for visual verification on key pages

