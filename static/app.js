// index.html is served from the repo root, with static/ and the x86_64/ dir
// (INDEX and the *.tar.xz files) next to it.
// INDEX lines: name|version|file|size|sha256|depends|desc
// Lines starting with @ are metadata, such as @serial|<timestamp>.
const ARCH = "x86_64";

const $ = (id) => document.getElementById(id);
const pkgs = new Map();
const rdeps = new Map();

function human(b) {
  if (b >= 1048576) return (b / 1048576).toFixed(1) + " MiB";
  if (b >= 1024) return (b / 1024).toFixed(1) + " KiB";
  return b + " B";
}

function el(tag, text, attrs = {}) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  Object.assign(e, attrs);
  return e;
}

function pkgLink(name) {
  return el("a", name, { href: "?pkg=" + encodeURIComponent(name) });
}

function fillList(ul, names) {
  ul.replaceChildren();
  if (!names.length) return ul.append(el("li", "none", { className: "muted" }));
  for (const n of names) {
    const li = el("li");
    if (pkgs.has(n)) li.append(pkgLink(n));
    else li.append(el("span", n + " (missing)", { className: "muted" }));
    ul.append(li);
  }
}

function showPkg(p) {
  document.title = p.name + " - Core Package Repository";
  $("p-name").textContent = p.name;
  $("p-ver").textContent = p.ver;
  $("p-desc").textContent = p.desc;
  $("d-arch").textContent = ARCH;
  $("d-size").textContent = human(p.size);
  $("d-sum").textContent = p.sum;
  $("d-file").textContent = p.file;
  $("d-file").href = ARCH + "/" + encodeURIComponent(p.file);
  $("d-install").textContent = "core add " + p.name;
  const rd = rdeps.get(p.name) || [];
  fillList($("p-deps"), p.deps);
  fillList($("p-rdeps"), rd);
  $("n-deps").textContent = p.deps.length || "";
  $("n-rdeps").textContent = rd.length || "";
  $("copy").textContent = "Copy";
}

function route() {
  const name = new URLSearchParams(location.search).get("pkg");
  const p = pkgs.get(name);
  const missing = !!name && !p;
  $("list-view").hidden = !!p || missing;
  $("pkg-view").hidden = !p;
  $("not-found").hidden = !missing;
  if (p) showPkg(p);
  if (missing) {
    document.title = "Not found - Core Package Repository";
    $("nf-name").textContent = name;
  }
}

async function main() {
  $("arch").textContent = ARCH;
  let text;
  try {
    const res = await fetch(ARCH + "/INDEX", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    text = await res.text();
  } catch (e) {
    $("error").textContent = "Could not load INDEX: " + e.message;
    $("error").hidden = false;
    return;
  }

  for (const line of text.split("\n")) {
    const [name, ver, file, size, sum, deps = "", ...desc] = line.split("|");
    if (!name || name.startsWith("@")) continue;
    pkgs.set(name, {
      name, ver, file, sum,
      size: Number(size),
      deps: deps.split(" ").filter(Boolean),
      desc: desc.join("|"),
    });
  }
  for (const p of pkgs.values())
    for (const d of p.deps) rdeps.set(d, [...(rdeps.get(d) || []), p.name]);

  const tbody = $("list");
  for (const p of pkgs.values()) {
    const tr = el("tr");
    const td = el("td");
    td.append(pkgLink(p.name));
    tr.append(td, el("td", p.ver, { className: "v" }), el("td", p.desc, { className: "hide-s" }));
    tbody.append(tr);
  }
  const search = () => {
    const s = $("q").value.toLowerCase();
    for (const tr of tbody.rows) tr.hidden = !tr.textContent.toLowerCase().includes(s);
  };
  // Keep the search in the URL (?q=) so it can be shared and survives reload
  $("q").value = new URLSearchParams(location.search).get("q") || "";
  search();
  $("q").addEventListener("input", () => {
    const url = new URL(location);
    if ($("q").value) url.searchParams.set("q", $("q").value);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
    search();
  });
  $("foot").textContent = pkgs.size + (pkgs.size === 1 ? " package" : " packages") + " indexed.";

  route();
}

// Old links used #name.
if (location.hash.length > 1)
  location.replace("?pkg=" + encodeURIComponent(decodeURIComponent(location.hash.slice(1))));

// Theme: "system" = nothing stored, follow the OS
const THEMES = ["light", "dark", "system"];
const systemDark = matchMedia("(prefers-color-scheme: dark)");

function storedTheme() {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && systemDark.matches);
  document.documentElement.classList.toggle("dark", dark);
  $("dark-mode").checked = dark;
  document.querySelector(".theme-value").textContent = theme;
}

function setTheme(theme) {
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {}
  applyTheme(theme);
}

$("dark-mode").addEventListener("change", (e) => setTheme(e.target.checked ? "dark" : "light"));
$("theme-cycle").addEventListener("click", () =>
  setTheme(THEMES[(THEMES.indexOf(storedTheme()) + 1) % THEMES.length]));
systemDark.addEventListener("change", () => storedTheme() === "system" && applyTheme("system"));
applyTheme(storedTheme());

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("d-install").textContent);
    $("copy").textContent = "Copied";
  } catch {
    $("copy").textContent = "Failed";
  }
  setTimeout(() => ($("copy").textContent = "Copy"), 1500);
});

main();
