# podcast-directory-action
Github action to maintain a directory of podcasts


# References

* [Creating a JavaScript action](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action)
* [Authentication in a workflow
](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow)
* [A curated list of awesome things related to GitHub Actions.](https://github.com/sdras/awesome-actions)
* [GitHub Actions Toolkit](https://github.com/actions/toolkit)
* [Github action Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
* [Template to bootstrap the creation of a JavaScript action](https://github.com/actions/javascript-action)


# issue

problem connecting

```
curl -v \
  -H "Accept: application/vnd.github.v3+json" -H "Authorization: token c4b8dec40c987f48285c0adb4861a3a14e4d50fb" \
  https://api.github.com/repos/pcarion/podcastfr
*   Trying 192.30.255.117...
* TCP_NODELAY set
* Connected to api.github.com (192.30.255.117) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/cert.pem
  CApath: none
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256
* ALPN, server accepted to use http/1.1
* Server certificate:
*  subject: C=US; ST=California; L=San Francisco; O=GitHub, Inc.; CN=*.github.com
*  start date: Jun 22 00:00:00 2020 GMT
*  expire date: Aug 17 12:00:00 2022 GMT
*  subjectAltName: host "api.github.com" matched cert's "*.github.com"
*  issuer: C=US; O=DigiCert Inc; OU=www.digicert.com; CN=DigiCert SHA2 High Assurance Server CA
*  SSL certificate verify ok.
> GET /repos/pcarion/podcastfr HTTP/1.1
> Host: api.github.com
> User-Agent: curl/7.64.1
> Accept: application/vnd.github.v3+json
> Authorization: token c4b8dec40c987f48285c0adb4861a3a14e4d50fb
>
< HTTP/1.1 401 Unauthorized
< Date: Tue, 12 Jan 2021 17:05:49 GMT
< Content-Type: application/json; charset=utf-8
< Content-Length: 90
< Server: GitHub.com
< Status: 401 Unauthorized
< X-GitHub-Media-Type: github.v3; format=json
< X-RateLimit-Limit: 60
< X-RateLimit-Remaining: 54
< X-RateLimit-Reset: 1610474438
< x-ratelimit-used: 6
< Access-Control-Expose-Headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, Deprecation, Sunset
< Access-Control-Allow-Origin: *
< Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
< X-Frame-Options: deny
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 1; mode=block
< Referrer-Policy: origin-when-cross-origin, strict-origin-when-cross-origin
< Content-Security-Policy: default-src 'none'
< Vary: Accept-Encoding, Accept, X-Requested-With
< X-GitHub-Request-Id: EBE1:7E78:F6AA3:137BC3:5FFDD6ED
<
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
* Connection #0 to host api.github.com left intact
* Closing connection 0
```
