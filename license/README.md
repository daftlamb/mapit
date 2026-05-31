# MapIt Pro License Tools

This folder contains MapIt Pro's bundled public-key verifier assets. Use this project's generator, or the shared generator in `..\emboss-lab\License Admin.cmd` only when its App field is set to `mapit-pro`.

## First setup

```powershell
npm run license:keygen
```

Keep `license/private-key.pem` secret. Do not ship it and do not commit it.
The desktop app only needs `license/public-key.pem`.

MapIt Pro currently shares the Emboss Lab signing key. The generator first checks `MAPIT_LICENSE_PRIVATE_KEY`, then `..\emboss-lab\license\private-key.pem`, and only uses a local `license\private-key.pem` if it matches this bundled `public-key.pem`.

## Generate a license

```powershell
npm run license:generate -- email=user@example.com
```

Optional fields:

```powershell
npm run license:generate -- email=user@example.com app=mapit-pro edition=pro expires=2027-12-31
```

Keep `app=mapit-pro` for normal customer licenses. Use `app=*` only for internal universal licenses, and only across apps that share this exact public key.

Codes may be pasted from email or chat with line breaks. The app removes whitespace before verification, but the admin tool also cleans the code when copying.

## Local admin app

```powershell
npm run license:admin
```

This opens a local desktop generator with fields for email, app, edition, and expiry.
It uses the matching private key on this machine and does not package the private key into customer apps.

If PowerShell blocks `npm.ps1`, run:

```powershell
npm.cmd run license:admin
```

Or double-click `License Admin.cmd` from the project folder.

