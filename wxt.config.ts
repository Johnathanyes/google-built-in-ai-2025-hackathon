import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: ".",
  entrypointsDir: "entrypoints",
  // runner config removed to use a temporary Chrome profile during dev
  manifest: {
    permissions: ['identity', 'storage'],
    host_permissions: [
      'https://www.googleapis.com/*',
      'https://accounts.google.com/*'
    ],
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA11f8utTi1iZLLpOgcLe2U9AJun9bOALMy490OLL0pEmvTGzKq3fooIcpoR8VPsk2f/bDgJKYDURnPNN98vdkkXEPzOKARpUf1xsyizeFc6JfwvAInFOB/pwrI6nT5KgSN5um1EiPjaQYM9uDZ/S0i6qQlSkZkZ2r2w+Dj460icxKSoSaiGQx4fnBj1+YsU/Ru3h3SvUn9O4xcEjBLFM41eqnRcIoUB1jdIa1kn1kxdgA88FeKEuP66j7wgaipypxMCcqLCfBFi7v/DenTxD0pswNgDxkmIwPJNoLhq3W+O3su4xSzu7IiLcJmhzLTa5Ld+uDpQbXL/GZGZmVreAzxQIDAQAB",
    oauth2: {
      client_id: '338701626887-vrqal5tptf81bn0a1nu6prd2837lm5mp.apps.googleusercontent.com',
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    }
  }
});
