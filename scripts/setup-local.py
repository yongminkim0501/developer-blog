#!/usr/bin/env python3
"""Create ignored local credentials once, without printing or overwriting them."""
from pathlib import Path
import os
import secrets
root = Path(__file__).resolve().parents[1]
path = root / ".env"
if path.exists():
    print(".env already exists; preserved existing configuration.")
else:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as output:
        output.write("DATABASE_PASSWORD=" + secrets.token_hex(24) + "\n")
        output.write("BLOG_ADMIN_TOKEN=" + secrets.token_hex(32) + "\n")
    print("Created .env with local database and admin credentials.")
