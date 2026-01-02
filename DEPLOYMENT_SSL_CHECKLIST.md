# Deployment Platform SSL Configuration Checklist

## For Arc Browser iPhone SSL Error Resolution

### Vercel (Most Common)

1. **Check Domain SSL Status**
   - Go to: https://vercel.com/dashboard
   - Navigate to your project → Settings → Domains
   - Check your custom domain
   - Verify SSL certificate status shows "Valid" or "Active"
   - Look for any warnings or errors

2. **Verify Certificate Details**
   - Click on your domain
   - Check certificate expiration date
   - Verify certificate is from Let's Encrypt or another trusted CA
   - Ensure auto-renewal is enabled

3. **Check for SSL Warnings**
   - Look for any yellow/red indicators
   - Check for "Certificate expiring soon" warnings
   - Verify no "Certificate chain incomplete" errors

4. **DNS Configuration**
   - Ensure DNS records are correctly configured
   - Verify A/AAAA or CNAME records point to Vercel
   - Check DNS propagation is complete

### Other Platforms

**Netlify:**
- Go to Site settings → Domain management
- Check SSL certificate status
- Verify certificate provider (Let's Encrypt, etc.)

**AWS/CloudFront:**
- Check ACM (AWS Certificate Manager)
- Verify certificate is active and validated
- Check CloudFront distribution SSL settings

**Custom Server:**
- SSH into server
- Check certificate files: `/etc/ssl/certs/` or similar
- Verify certificate chain is complete
- Check nginx/apache SSL configuration
- Ensure TLS 1.2+ is enabled

## Common Issues to Check

1. **Certificate Expiration**
   - Certificate should not expire within 30 days
   - Auto-renewal should be enabled
   - Check renewal logs for errors

2. **Certificate Chain**
   - Should include root, intermediate, and leaf certificates
   - Missing intermediates cause validation failures
   - Some browsers (like Arc) are stricter about this

3. **TLS Version Support**
   - Should support TLS 1.2 minimum
   - TLS 1.3 preferred
   - Older versions (TLS 1.0, 1.1) should be disabled

4. **Cipher Suites**
   - Should use strong, modern ciphers
   - Weak ciphers can cause validation failures
   - Check SSL Labs report for recommendations

## Testing After Fixes

1. Run SSL Labs test: https://www.ssllabs.com/ssltest/
2. Test in Arc browser on iPhone
3. Test in Safari/Chrome to ensure still working
4. Check browser console for any SSL errors
5. Verify HSTS header is being sent correctly

## If Issue Persists

If SSL certificate is valid but Arc still fails:

1. **HSTS Cache Issue**
   - Arc may have cached bad HSTS state
   - Consider temporarily reducing HSTS max-age
   - Wait for cache to expire (up to 1 year with current config)

2. **Browser-Specific Validation**
   - Arc may use stricter validation
   - Check Certificate Transparency logs
   - Verify certificate is in CT logs

3. **Network/Proxy Issues**
   - Check if network is intercepting SSL
   - Verify no corporate proxy modifying certificates
   - Test on different network

## Next Steps

After checking deployment platform:
1. Document findings
2. Fix any certificate issues found
3. Test in Arc browser
4. Adjust HSTS if needed
5. Monitor SSL certificate status

