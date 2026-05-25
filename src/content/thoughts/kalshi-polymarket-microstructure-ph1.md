---
title: kalshi-polymarket-microstructure Ph1
topic: scaffold + pipeline validation
date: 2026-05-25T15:00:00
---
repo, two thin client modules (clients/kalshi.py, clients/polymarket.py), one notebook that pulls one known market from each venue and prints the orderbook. Validates the data layer end-to-end before any mapping work.

1. clone the GitHub repo into ~/Downloads/Projects/
2. Scaffold the directory tree (src/pm_micro/, notebooks/, data/, test/)
3. Write `pyproject.toml` with uv, including `kalshi-python`, `py-clob-client`, `pandas`, `httpx`, `jupyter`, `matplotlib`, `pyyaml`, `pytest`
4. Write thin client wrappers (`src/pm_micro/clients/kalshi.py` and `polymarket.py`) – enough to call `get_orderbook` on each
5. Write `notebook/00_pipeline_validation.ipynb` that fetches one hardcoded market from each venue and prints both orderbooks side-by-side
6. Write a stub `README` pointing at the notebook
7. Initial commit, push to main

The goal of the full project, again, is empirical cross-venue microstructure analysis of Kalshi and Polymarket prediction markets.
