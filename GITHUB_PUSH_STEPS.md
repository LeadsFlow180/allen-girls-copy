# Push to GitHub – Fix “No credentials” on Windows

Your commit is already saved. You just need to sign in to GitHub once so Git can push.

---

## Option A: Push from Windows Terminal (easiest)

1. **Open Windows Terminal or PowerShell** (not inside Cursor):  
   Press `Win`, type `PowerShell` or `Terminal`, press Enter.

2. **Go to your project:**
   ```powershell
   cd "C:\Users\Owner\Documents\Cursor AI Projects\allen_girls_adventures"
   ```

3. **Push:**
   ```powershell
   git push origin main
   ```

4. When Git asks for credentials:
   - **Username:** your GitHub username (e.g. `LeadsFlow180`)
   - **Password:** use a **Personal Access Token**, not your GitHub password (see Option B for how to create one)

After you enter the token once, Git will remember it and future pushes will work from Cursor too.

---

## Option B: Create a GitHub Personal Access Token

GitHub no longer accepts your account password for `git push`. You must use a token.

1. **Sign in to GitHub** in your browser.

2. **Open token settings:**  
   https://github.com/settings/tokens

3. **Create a token:**
   - Click **“Generate new token”** → **“Generate new token (classic)”**.
   - Name it something like `allen-girls-adventures`.
   - Set **Expiration** (e.g. 90 days or “No expiration”).
   - Under **Scopes**, check **`repo`** (full control of private repositories).
   - Click **“Generate token”**.

4. **Copy the token** (you won’t see it again).

5. **Use it when Git asks for a password:**
   - Run `git push origin main` (from Windows Terminal or from Cursor).
   - When prompted for **password**, paste the token (not your GitHub password).

---

## Quick checklist

- [ ] Opened PowerShell or Windows Terminal (outside Cursor)
- [ ] `cd` to project folder
- [ ] Created a token at https://github.com/settings/tokens (scope: `repo`)
- [ ] Ran `git push origin main`
- [ ] Entered GitHub username and token when asked

After this works once, you usually won’t need to do it again for this repo.
