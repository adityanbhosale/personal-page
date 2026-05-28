---
title: "[F] – Event Driven Dynamics Test"
topic: kalshi-polymarket microstructure
date: 2026-05-28T12:26:00
---
This dev task's timing depends on when the Colombia catalyst actually happens. First round election is Sunday May 31, 2026. Note that the catalyst is not a single instance. Polls open at 8:00AM (local) and preliminary results are typically available by 7:00PM (local). So, the resolution window is *several-hour evening of vote-counting*.

Goal: build the event-driven capture harness (F.1) for the Colombia first-round presidential election, Sunday 2026-05-31. This is a targeted high-frequency overlay + windowing harness, NOT a second 16-market poller. The existing E.1 daemon keeps running at 30s across all markets; F.1 adds dense capture on the Colombia markets only during the event window, plus the analysis scaffold to window data around the catalyst.
