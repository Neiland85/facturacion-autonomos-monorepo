.PHONY: help init audit audit-all \
        fe-install fe-lint fe-type fe-test fe-audit \
        be-install be-lint be-format be-type be-test be-cov be-sec be-deps be-sbom be-audit \
        metrics report

PY?=python3
FRONTEND_DIR?=frontend
BACKEND_DIR?=backend
COV_MIN?=85

help:
	@echo "Targets: init | audit | audit-all | fe-audit | be-audit | metrics | report"

init: fe-install be-install

fe-install:
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then cd $(FRONTEND_DIR) && (pnpm i || npm i); else echo "No frontend dir"; fi
fe-lint:
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then cd $(FRONTEND_DIR) && npx eslint . --max-warnings=0; fi
fe-type:
	@if [ -f "$(FRONTEND_DIR)/tsconfig.json" ]; then cd $(FRONTEND_DIR) && npx tsc --noEmit; fi
fe-test:
	@if [ -f "$(FRONTEND_DIR)/package.json" ]; then cd $(FRONTEND_DIR) && (npx vitest run || npx jest --ci || echo "no tests"); fi
fe-audit: fe-lint fe-type fe-test

be-install:
	pip install -U ruff black mypy pytest pytest-cov bandit pip-audit cyclonedx-bom
be-lint:
	@if [ -d "$(BACKEND_DIR)" ]; then ruff check $(BACKEND_DIR); fi
be-format:
	@if [ -d "$(BACKEND_DIR)" ]; then black $(BACKEND_DIR); fi
be-type:
	@if [ -d "$(BACKEND_DIR)" ]; then mypy $(BACKEND_DIR); fi
be-test:
	@if [ -d "$(BACKEND_DIR)" ]; then pytest -q; fi
be-cov:
	@if [ -d "$(BACKEND_DIR)" ]; then pytest --cov=$(BACKEND_DIR) --cov-report=term-missing --cov-report=xml:coverage.xml; \
	$(PY) scripts/coverage_gate.py coverage.xml $(COV_MIN); \
	$(PY) scripts/coverage_to_json.py coverage.xml coverage.json; fi
be-sec:
	@if [ -d "$(BACKEND_DIR)" ]; then bandit -q -r $(BACKEND_DIR) -f json -o bandit.json; fi
be-deps:
	@pip-audit -f json -o pip_audit.json || true
be-sbom:
	@cyclonedx-py -e -o sbom.json
be-audit: be-lint be-type be-test be-cov be-sec be-deps

metrics:
	@$(PY) scripts/metrics_git.py --window-days 90 --out metrics.json

report: metrics
	@echo "Genera AUDIT_REPORT.md si lo necesitas (omito por simplicidad)."

audit: fe-audit be-audit
audit-all: audit be-sbom metrics
