# SEO Testing Guide for Pettabl Landing Page

## ✅ Current Implementation Status

### What We're Using
- ✅ **react-helmet-async** (not deprecated react-helmet)
- ✅ Comprehensive meta tags
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Structured Data (JSON-LD)
- ✅ Canonical URLs
- ✅ Mobile app meta tags

### Current Limitation
⚠️ **SPA (Single Page Application)**: The app is client-side rendered via Expo Web, which means:
- Meta tags are injected via JavaScript after page load
- Search engines may need to execute JavaScript to see meta tags
- Google can handle this, but other crawlers may struggle

### Recommended Solutions (Future)
1. **Server-Side Rendering (SSR)**: Use Next.js or Remix for better SEO
2. **Static Site Generation (SSG)**: Pre-render landing page at build time
3. **Prerendering Service**: Use services like Prerender.io or Netlify Prerendering

---

## 🧪 Free SEO Testing Tools

### 1. Google Search Console
**URL**: https://search.google.com/search-console

**What to Check:**
- ✅ Submit your sitemap
- ✅ Check indexing status
- ✅ Monitor crawl errors
- ✅ View Core Web Vitals report
- ✅ Check mobile usability

**Steps:**
1. Add your property (pettabl.com)
2. Verify ownership (DNS or HTML file)
3. Submit sitemap.xml (if available)
4. Request indexing for landing page
5. Monitor "Coverage" report for errors

---

### 2. Google PageSpeed Insights
**URL**: https://pagespeed.web.dev/

**What to Check:**
- ✅ Page speed score (mobile & desktop)
- ✅ Core Web Vitals:
  - **LCP** (Largest Contentful Paint) - should be < 2.5s
  - **INP** (Interaction to Next Paint) - should be < 200ms
  - **CLS** (Cumulative Layout Shift) - should be < 0.1
- ✅ Performance metrics
- ✅ Accessibility score
- ✅ Best practices

**How to Test:**
1. Enter your landing page URL
2. Click "Analyze"
3. Review mobile and desktop scores
4. Fix issues highlighted in red/yellow

---

### 3. Ahrefs Webmaster Tools (AWT)
**URL**: https://ahrefs.com/webmaster-tools

**What to Check:**
- ✅ Technical SEO audit
- ✅ On-page SEO issues
- ✅ Backlink analysis
- ✅ Site health score
- ✅ Crawl errors

**Steps:**
1. Sign up for free account
2. Add your website
3. Verify ownership
4. Run site audit
5. Review technical issues

---

### 4. Additional Free Tools

#### Meta Tags Preview
- **URL**: https://metatags.io/
- **Purpose**: Preview how your page looks when shared on social media
- **Check**: Open Graph tags, Twitter Cards

#### Schema Markup Validator
- **URL**: https://validator.schema.org/
- **Purpose**: Validate JSON-LD structured data
- **Check**: Our SoftwareApplication schema

#### Mobile-Friendly Test
- **URL**: https://search.google.com/test/mobile-friendly
- **Purpose**: Check mobile responsiveness
- **Check**: Mobile usability issues

#### Rich Results Test
- **URL**: https://search.google.com/test/rich-results
- **Purpose**: Test structured data
- **Check**: JSON-LD validation

---

## 🔍 Manual SEO Checklist

### Meta Tags Verification
```bash
# View page source (right-click → View Page Source)
# Check for:
✅ <title> tag with keywords
✅ <meta name="description"> tag
✅ <meta name="keywords"> tag
✅ Open Graph tags (og:title, og:description, og:image)
✅ Twitter Card tags
✅ Canonical URL
✅ Structured data (JSON-LD)
```

### View Rendered HTML (Important for SPAs)
Since we're using a SPA, you need to check the **rendered** HTML, not just the source:

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Go to "Elements" tab
   - Check `<head>` section
   - Verify all meta tags are present

2. **View Rendered Source**:
   - Right-click → "Inspect"
   - In Elements tab, check `<head>`
   - All Helmet tags should be visible

### Social Media Preview Test
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Enter URL
   - Click "Scrape Again" to refresh cache
   - Verify Open Graph tags

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter URL
   - Verify Twitter Card preview

3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Enter URL
   - Verify Open Graph preview

---

## 📊 Key Metrics to Monitor

### Search Console Metrics
- **Impressions**: How often your page appears in search
- **Clicks**: How many users click through
- **CTR**: Click-through rate (clicks/impressions)
- **Average Position**: Where you rank in search results

### PageSpeed Metrics
- **Performance Score**: Aim for 90+ (mobile & desktop)
- **LCP**: < 2.5 seconds
- **INP**: < 200ms
- **CLS**: < 0.1

### Technical SEO
- ✅ All pages crawlable
- ✅ No broken links
- ✅ Proper redirects (301 for moved pages)
- ✅ XML sitemap submitted
- ✅ robots.txt configured

---

## 🚀 Quick Test Commands

### Test Meta Tags Locally
```bash
# Start dev server
cd mobile
npx expo start --web

# In another terminal, test with curl
curl http://localhost:8083 | grep -i "meta\|title"

# Or use browser DevTools to inspect <head>
```

### Test Production URL
```bash
# After deployment, test production URL
curl https://pettabl.com | grep -i "meta\|title"

# Or use online tools:
# - https://metatags.io/
# - https://www.opengraph.xyz/
```

---

## 🔧 Current Implementation Details

### Meta Tags Location
- **File**: `mobile/src/screens/LandingScreen.tsx`
- **Component**: `<Helmet>` (only renders on web)
- **Condition**: `{isWeb && <Helmet>...</Helmet>}`

### Structured Data
- **Type**: SoftwareApplication (JSON-LD)
- **Location**: Injected via `<script type="application/ld+json">`
- **Content**: App name, category, OS, pricing, ratings

### Social Sharing
- **Open Graph**: Full implementation
- **Twitter Cards**: summary_large_image
- **Image**: `/logo-pettabl.png` (update to full URL in production)

---

## ⚠️ Known Limitations & Solutions

### Limitation: SPA JavaScript Execution
**Problem**: Meta tags injected via JavaScript may not be seen by all crawlers.

**Current Mitigation**:
- Google executes JavaScript (works)
- Meta tags are comprehensive (good)
- HelmetProvider properly configured (good)

**Future Improvements**:
1. **Add Prerendering**: Use Prerender.io or similar
2. **SSR Migration**: Consider Next.js for landing page
3. **Static Export**: Pre-render landing page at build time

### Limitation: Image URLs
**Current**: Relative paths (`/logo-pettabl.png`)
**Should Be**: Absolute URLs (`https://pettabl.com/logo-pettabl.png`)

**Fix**: Update `ogImage` constant in LandingScreen.tsx:
```typescript
const ogImage = `${siteUrl}/logo-pettabl.png`; // ✅ Already correct!
```

---

## 📝 Testing Checklist

Before going live, verify:

- [ ] Meta tags visible in rendered HTML (DevTools)
- [ ] Title tag contains keywords
- [ ] Description is compelling and under 160 chars
- [ ] Open Graph preview works on Facebook
- [ ] Twitter Card preview works
- [ ] Structured data validates (schema.org validator)
- [ ] PageSpeed score > 90
- [ ] Mobile-friendly test passes
- [ ] All images have alt text
- [ ] Canonical URL is correct
- [ ] No duplicate content issues
- [ ] robots.txt allows crawling
- [ ] Sitemap submitted to Search Console

---

## 🎯 Next Steps

1. **Deploy to Production**: Get live URL
2. **Submit to Search Console**: Add property and verify
3. **Test with Tools**: Run all free tools listed above
4. **Monitor Performance**: Check Search Console weekly
5. **Optimize Based on Results**: Fix issues as they arise

---

## 📚 Resources

- [Google Search Central](https://developers.google.com/search)
- [react-helmet-async Docs](https://github.com/staylor/react-helmet-async)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Last Updated**: 2025-01-14
**Status**: ✅ SEO meta tags implemented, ready for testing

