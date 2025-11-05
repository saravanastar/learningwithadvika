# Deployment Guide - learningwithadvika.com

This guide will help you publish your website with the domain `learningwithadvika.com`.

## Option 1: Netlify (Recommended - Easiest)

Netlify offers free hosting with easy custom domain setup.

### Steps:

1. **Create a Netlify Account**
   - Go to https://www.netlify.com
   - Sign up for a free account (use GitHub, email, etc.)

2. **Deploy Your Site**
   - Log in to Netlify
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your entire `library` folder OR
   - Use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify login
     netlify deploy --prod
     ```

3. **Configure Custom Domain**
   - In Netlify dashboard, go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `learningwithadvika.com`
   - Follow Netlify's DNS instructions

4. **Configure DNS (if you own the domain)**
   - If you already own `learningwithadvika.com`:
     - Add a CNAME record: `www` → `your-site-name.netlify.app`
     - Add an A record: `@` → Netlify's IP (provided in dashboard)
   - If you don't own it yet:
     - Purchase from Namecheap, GoDaddy, or Google Domains
     - Then configure DNS as above

## Option 2: GitHub Pages (Free)

### Steps:

1. **Create GitHub Repository**
   - Create a new repository on GitHub
   - Name it anything (e.g., `learning-library`)

2. **Upload Files**
   - Initialize git in your project folder:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
     git push -u origin main
     ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

4. **Custom Domain Setup**
   - In Pages settings, enter `learningwithadvika.com`
   - Create a file named `CNAME` in your repository root:
     ```
     learningwithadvika.com
     ```
   - Configure DNS:
     - Add CNAME: `@` → `YOUR_USERNAME.github.io`
     - Add CNAME: `www` → `YOUR_USERNAME.github.io`

## Option 3: Vercel (Free)

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd library
   vercel
   ```

3. **Add Custom Domain**
   - In Vercel dashboard → Settings → Domains
   - Add `learningwithadvika.com`
   - Configure DNS as instructed

## Option 4: Traditional Web Hosting

If you have a web hosting account (cPanel, etc.):

1. **Upload Files via FTP**
   - Use FileZilla or your hosting provider's file manager
   - Upload all files to `public_html` or `www` folder
   - Maintain the folder structure (css/, js/)

2. **Configure Domain**
   - Point your domain to your hosting provider
   - Your site will be live at `learningwithadvika.com`

## Quick Start (Netlify - Recommended)

### Using Netlify Drop (No CLI needed):

1. Go to https://app.netlify.com/drop
2. Drag your entire `library` folder
3. Your site gets a temporary URL
4. Go to Site settings → Domain management
5. Add custom domain: `learningwithadvika.com`
6. Follow DNS configuration instructions

## Important Notes

- **Domain Registration**: If you don't own `learningwithadvika.com` yet, purchase it first from:
  - Namecheap.com
  - GoDaddy.com
  - Google Domains
  - Cloudflare (also offers free DNS)

- **SSL Certificate**: Netlify, Vercel, and GitHub Pages provide free SSL certificates automatically

- **File Structure**: Make sure `index.html` is in the root of what you deploy

## Testing Before Going Live

1. Test locally: `http://localhost:8000`
2. Test on temporary Netlify/Vercel URL
3. Then connect custom domain

## Need Help?

- Netlify Docs: https://docs.netlify.com
- GitHub Pages: https://pages.github.com
- Vercel Docs: https://vercel.com/docs

