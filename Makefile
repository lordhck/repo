.PHONY: repo

# Docker would create missing mount dirs as root.
repo:
	@mkdir -p x86_64 keys $${COREPKGS_SECRETS:-$$HOME/.config/corepkgs}
	docker compose run --rm --build --user "$$(id -u):$$(id -g)" corepkgs
