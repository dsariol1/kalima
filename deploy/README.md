# Kalima+ Backend — Deploy-Runbook (VPS + PocketBase)

Schritt-für-Schritt zum selbst-gehosteten Backend. Alles auf **deinem** Hetzner-Konto
und DNS — die Befehle führst du aus, nichts davon passiert automatisch.

Zielzustand: PocketBase läuft als systemd-Service, nur lokal gebunden, Caddy davor
mit automatischem HTTPS unter `https://api.kalima.sariol.ch`.

Die Config-Dateien in diesem Ordner werden auf den Server kopiert (Pfade unten).

---

## 1. VPS anlegen (Hetzner Cloud)

- Server erstellen: **CX22** (2 vCPU, 4 GB), Image **Debian 12**, Standort
  Nürnberg/Falkenstein.
- **SSH-Key** beim Erstellen hinterlegen (nicht Passwort-Login).
- **Backups aktivieren** (Häkchen „Backups" in der Konsole, ~20 % Aufpreis) — das sind
  die Whole-Server-Snapshots als erste Backup-Ebene.
- Öffentliche IP notieren.

## 2. DNS

Beim DNS-Provider von `sariol.ch`:
- `A`-Record: `api.kalima` → VPS-IPv4.
- `AAAA`-Record: `api.kalima` → VPS-IPv6 (falls vorhanden).

Vor Schritt 6 (Caddy) muss das propagiert sein, sonst schlägt der Cert-Bezug fehl.
Prüfen: `dig +short api.kalima.sariol.ch`.

## 3. Erst-Login + Grundhärtung

```bash
ssh root@<VPS-IP>

# System aktuell
apt update && apt upgrade -y
apt install -y sqlite3 unzip ufw

# Non-root sudo-User
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys

# Firewall: nur SSH + HTTP + HTTPS
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# SSH härten
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

Ab jetzt als `deploy` einloggen: `ssh deploy@<VPS-IP>`. Root-Login ist zu.

## 4. PocketBase installieren

```bash
# Dedizierter Service-User (kein Login-Shell nötig)
sudo useradd --system --home /opt/pocketbase --shell /usr/sbin/nologin pocketbase
sudo mkdir -p /opt/pocketbase
cd /opt/pocketbase

# Neueste Version von https://github.com/pocketbase/pocketbase/releases holen
# (Version-Tag ggf. anpassen — hier Beispiel):
PB_VERSION=0.30.0
sudo curl -L -o pb.zip \
  "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip"
sudo unzip pb.zip && sudo rm pb.zip
sudo chown -R pocketbase:pocketbase /opt/pocketbase
```

systemd-Unit installieren (Datei `pocketbase.service` aus diesem Ordner):

```bash
sudo cp pocketbase.service /etc/systemd/system/pocketbase.service
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl status pocketbase   # active (running)?
```

PocketBase lauscht jetzt auf `127.0.0.1:8090` — noch nicht öffentlich.

## 5. Caddy installieren (Reverse-Proxy + HTTPS)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Caddyfile (aus diesem Ordner) einspielen:

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 6. Smoke-Test

```bash
curl -I https://api.kalima.sariol.ch/api/health
```
Erwartung: `HTTP/2 200` mit gültigem TLS. Falls Cert-Fehler → DNS noch nicht
propagiert oder Port 80/443 zu (ufw prüfen).

## 7. PocketBase konfigurieren (Admin-UI)

Im Browser: `https://api.kalima.sariol.ch/_/`

1. **Superadmin** anlegen (E-Mail `dsariol@pm.me`).
2. **SMTP** (Settings → Mail settings): externen Relay eintragen — Port 25 ausgehend
   ist auf den meisten VPS gesperrt, also SMTP-Dienst/Mailprovider mit
   Port 587 + Auth nutzen. Ohne SMTP funktioniert „Passwort vergessen" nicht.
   Test-Mail über die UI verschicken.
3. Eingebaute **`users`**-Collection: email/Passwort ist bereits aktiv. „Require email
   verification" vorerst **aus** (schnelleres Onboarding), später aktivierbar.
4. **Collections + API-Rules** anlegen — siehe `SCHEMA.md` in diesem Ordner.
   ⚠️ Die API-Rules sind sicherheitskritisch: ohne sie kann jeder eingeloggte Nutzer
   fremde Daten lesen. Erst setzen, dann Frontend anbinden.

## 8. App-Level-Backup-Timer

```bash
sudo cp backup-pocketbase.sh /opt/pocketbase/backup-pocketbase.sh
sudo chmod +x /opt/pocketbase/backup-pocketbase.sh
sudo chown pocketbase:pocketbase /opt/pocketbase/backup-pocketbase.sh
sudo cp pocketbase-backup.service /etc/systemd/system/
sudo cp pocketbase-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase-backup.timer
sudo systemctl start pocketbase-backup.service   # einmal testen
ls -la /opt/pocketbase/backups/                  # data-YYYY-MM-DD.db.gz?
```

Für die Off-box-Kopie: in `backup-pocketbase.sh` die rclone- oder scp-Zeile
einkommentieren und konfigurieren.

## 9. Frontend anbinden

- Lokal: `.env` mit `VITE_POCKETBASE_URL=https://api.kalima.sariol.ch`.
- Vercel: dieselbe Variable in den Projekt-Env-Settings (Production) setzen, dann
  redeploy.

---

## Update von PocketBase später

```bash
sudo systemctl stop pocketbase
# neues Binary nach /opt/pocketbase/pocketbase (wie Schritt 4)
sudo systemctl start pocketbase
```
`pb_data/` (DB + Auth) bleibt unangetastet. Vorher lohnt ein manueller Backup-Lauf
(Schritt 8).
