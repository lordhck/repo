# corepkgs

The Core Linux package repository: https://pkgs.lordhck.com

Packages are built with makepkg. This repository signs them and publishes
them.

## Layout

    x86_64/      the repository: INDEX and packages, all signed
    keys/        corepkgs.pub, the public key Core uses to check signatures
    repo         the tool that signs packages and updates INDEX
    docker/      the container repo runs in
    index.html   the website
    static/

## Setup

```sh
make repo          # opens the corepkgs container
repo keygen        # once: creates the signing key
```

The private key is stored in `~/.config/corepkgs/` and never leaves your
machine.

## Release a package

1. Build it in its project: `makepkg`
2. Add it in the container: `repo add /packages/<name>/<name>-<version>.tar.xz`
3. Check: `repo verify`
4. Commit and push `x86_64/`. GitHub Actions publishes it.

`/packages` is `../packages`. Set `COREPKGS_PACKAGES` to use another folder.

## Commands

    repo add <pkg>...      sign packages and add them to the repo
    repo remove <name>...  remove packages from the repo
    repo verify            check INDEX and every package
    repo keygen            create the signing key

## INDEX

One line per package:

    name|version|file|size|sha256|depends|desc

`INDEX.sig` signs INDEX, and every package has its own `.sig`.
