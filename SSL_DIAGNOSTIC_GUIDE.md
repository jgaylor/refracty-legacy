# SSL Certificate Diagnostic Guide

## For Arc Browser iPhone SSL Error

This guide helps diagnose and fix the SSL error occurring in Arc browser on iPhone.

## Error Message
"An SSL error has occurred and a secure connection to the server cannot be made."

## Quick Diagnostic Steps

### 1. Test SSL Certificate with SSL Labs
Visit: https://www.ssllabs.com/ssltest/

Enter your production domain and check:
- **Overall Rating** - Should be A or A+
- **Certificate** - Should show "Trusted" with complete chain
- **Protocol Support** - Should support TLS 1.2 and TLS 1.3
- **Certificate Chain** - Should show complete chain (no warnings about missing intermediates)

### 2. Check Certificate Details
Look for these issues in SSL Labs report:
- ❌ Certificate not trusted
- ❌ Incomplete certificate chain
- ❌ Certificate expired or expiring soon
- ❌ Weak cipher suites
- ❌ Missing intermediate certificates

### 3. Check Deployment Platform (Vercel)
If using Vercel:
1. Go to your project dashboard
2. Navigate to Settings → Domains
3. Check your custom domain SSL status
4. Look for any warnings or errors
5. Verify certificate auto-renewal is enabled

### 4. Test HSTS Impact
The current HSTS configuration is:
```
Strict-Transport-Security: max-age=31536000
```

If Arc browser previously encountered an SSL issue, it may have cached this HSTS policy for 1 year.

**To test if HSTS cache is the issue:**
1. Temporarily reduce HSTS max-age to 86400 (1 day) in `next.config.ts`
2. Deploy the change
3. Test in Arc browser
4. If it works, HSTS cache was the problem
5. Increase max-age back once certificate is fixed

### 5. Clear Arc Browser HSTS Cache (User-Side)
Unfortunately, iOS browsers don't typically allow clearing HSTS cache directly. Options:
- Wait for HSTS max-age to expire (not practical with 1 year)
- Use Safari/Chrome as workaround
- Reinstall Arc browser (may clear cache)

## Common Solutions

### Solution 1: Fix Certificate Chain
If SSL Labs shows incomplete certificate chain:
- Ensure all intermediate certificates are installed on your server
- Check deployment platform SSL settings
- Verify certificate bundle includes intermediates

### Solution 2: Update Certificate
If certificate is expired or from untrusted CA:
- Renew certificate through your deployment platform
- Ensure certificate is from trusted CA (Let's Encrypt, etc.)
- Wait for certificate to propagate

### Solution 3: Adjust HSTS (Temporary)
If HSTS cache is the issue:
- Reduce max-age temporarily
- Fix underlying certificate issue
- Increase max-age back to 1 year

## Verification Checklist

- [ ] SSL Labs test shows A or A+ rating
- [ ] Certificate is trusted and not expired
- [ ] Certificate chain is complete
- [ ] TLS 1.2+ is supported
- [ ] No SSL warnings in deployment platform
- [ ] HSTS max-age is appropriate
- [ ] All redirects use absolute URLs (verified in code)

## Next Steps After Diagnosis

1. **If SSL Labs shows issues:** Fix certificate configuration on deployment platform
2. **If SSL Labs shows A+ rating:** Likely Arc's cached HSTS state - may need to wait or adjust HSTS
3. **If certificate is valid:** Consider temporarily reducing HSTS max-age to test

## Code Changes Made

1. ✅ Verified all redirects use absolute URLs (NextResponse.redirect with new URL())
2. ✅ Added `includeSubDomains` to HSTS header (best practice)
3. ✅ Documented diagnostic steps

