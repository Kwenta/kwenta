dev:
	@NODE_OPTIONS=--max_old_space_size=4096 npm run dev

build:
	@npm run $@

lint:
	@npm run $@

.PHONY: dev build lint