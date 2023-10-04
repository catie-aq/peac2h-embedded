/** @type {import('next').NextConfig} */

const path = require('path')

const nextConfig = {
  output: 'export',


  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
 
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
 
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
}
 
module.exports = nextConfig
