/* ===================== Vault UI ===================== */

const $ = (id) => document.getElementById(id);

function showLocked() {
    const creating = !Vault.exists();
    $("lockedTitle").textContent = creating ? "Create Vault" : "Unlock Vault";
    $("lockedHelp").textContent = creating
        ? "Choose a master password (12+ characters). It is never stored. If you forget it, the vault cannot be recovered."
        : "Enter your master password.";
    $("unlockBtn").textContent = creating ? "Create" : "Unlock";
    $("master2").classList.toggle("hidden", !creating);
    $("lockedView").classList.remove("hidden");
    $("unlockedView").classList.add("hidden");
    $("master").value = $("master2").value = "";
    $("site").value = $("user").value = $("pw").value = "";   // don't leave a typed password behind
    $("rows").replaceChildren();          // wipe decrypted data from the page
}

async function showUnlocked() {
    $("lockedView").classList.add("hidden");
    $("unlockedView").classList.remove("hidden");
    await render();
}

async function render() {
    const tbody = $("rows");
    tbody.replaceChildren();
    for (const e of await Vault.listEntries()) {
        const tr = document.createElement("tr");
        const pwCell = document.createElement("td");
        pwCell.textContent = "••••••••";

        const actions = document.createElement("td");
        const reveal = document.createElement("button");
        reveal.textContent = "Show";
        reveal.onclick = () => {            // reveal for 5 seconds only
            pwCell.textContent = e.password;
            setTimeout(() => pwCell.textContent = "••••••••", 5000);
        };
        const copy = document.createElement("button");
        copy.textContent = "Copy";
        copy.onclick = async () => {
            await navigator.clipboard.writeText(e.password);
            $("msg").textContent = "Copied (clipboard clears in 30s)";
            setTimeout(() => navigator.clipboard.writeText("").catch(() => {}), 30000);
        };
        const del = document.createElement("button");
        del.textContent = "Delete";
        del.onclick = async () => { Vault.deleteEntry(e.id); await render(); };
        actions.append(reveal, copy, del);

        for (const text of [e.site || "(no site)", e.username || "—"]) {
            const td = document.createElement("td");
            td.textContent = text;              // textContent, never innerHTML
            tr.append(td);
        }
        tr.append(pwCell, actions);
        tbody.append(tr);
    }
}

$("unlockBtn").onclick = async () => {
    $("lockedMsg").textContent = "Deriving key…";
    try {
        if (!Vault.exists()) {
            if ($("master").value !== $("master2").value) throw new Error("Passwords do not match");
            await Vault.create($("master").value);
        } else {
            await Vault.unlock($("master").value);
        }
        $("lockedMsg").textContent = "";
        await showUnlocked();
        fillPendingPassword();          // finish a "Save to Vault" that was waiting on unlock
    } catch (err) {
        $("lockedMsg").textContent = err.message;
    }
};

$("addBtn").onclick = async () => {
    if (!$("pw").value) { $("msg").textContent = "Password is required"; return; }   // site and username are optional
    await Vault.addEntry($("site").value, $("user").value, $("pw").value);
    $("site").value = $("user").value = $("pw").value = "";
    $("msg").textContent = "Saved (encrypted)";
    await render();
};

$("lockBtn").onclick = () => Vault.lock();

$("exportBtn").onclick = () => {
    const blob = new Blob([Vault.exportVault()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vault-backup.json";
    a.click();
};

// Import: open the file picker from either screen
document.querySelectorAll(".importBtn").forEach((btn) => {
    btn.onclick = () => $("importFile").click();
});

$("importFile").onchange = async () => {
    const file = $("importFile").files[0];
    $("importFile").value = "";            // allow picking the same file again later
    if (!file) return;

    if (Vault.exists() && !confirm(
        "Importing will REPLACE the vault currently stored in this browser. " +
        "Export it first if you want to keep it. Continue?")) {
        return;
    }

    try {
        Vault.importVault(await file.text());   // validates format, then locks
        showLocked();
        $("lockedMsg").textContent =
            "Backup imported. Unlock with the master password used when it was exported.";
    } catch (err) {
        const msgEl = Vault.isUnlocked() ? $("msg") : $("lockedMsg");
        msgEl.textContent = "Import failed: " +
            (err instanceof SyntaxError ? "file is not valid JSON" : err.message);
    }
};

/* ============ Integration: generator -> checker -> vault ============ */

// Holds a generated password in memory (never in storage) while the vault is locked.
let pendingPassword = null;

// Runs right after the partner's genPassword(): send the result to the strength checker.
function afterGenerate() {
    const generated = $("generatedPassword").innerText;
    if (!generated) return;
    $("pass").value = generated;
    evaluatePass(generated);
}

// "Save to Vault": use the generated password, or whatever is typed in the checker box.
$("saveGenerated").onclick = () => {
    const password = $("generatedPassword").innerText || $("pass").value;
    if (!password) { alert("Generate or type a password first."); return; }

    pendingPassword = password;
    if (Vault.isUnlocked()) {
        fillPendingPassword();
    } else {
        // Stay on this page: ask for the master password in the vault panel above.
        showLocked();
        $("lockedMsg").textContent = Vault.exists()
            ? "Unlock your vault to save the generated password."
            : "Create a vault to save the generated password.";
        $("lockedView").scrollIntoView({ behavior: "smooth" });
        $("master").focus();
    }
};

// Put the waiting password into the Add Entry form so the user can add a site/username.
function fillPendingPassword() {
    if (!pendingPassword) return;
    $("pw").value = pendingPassword;
    pendingPassword = null;
    $("msg").textContent = "Generated password added. Enter the site and username, then click Save.";
    $("unlockedView").scrollIntoView({ behavior: "smooth" });
    $("site").focus();
}

Vault.onLock = () => { pendingPassword = null; showLocked(); };   // auto-lock also discards a waiting password
showLocked();
