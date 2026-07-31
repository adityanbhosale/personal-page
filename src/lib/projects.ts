// src/lib/projects.ts
// Single source for the project list. Read by the homepage block and by
// /projects, which show different amounts of the same records — the homepage
// takes `summary`, the projects page takes `blurb`.
//
// Adding a project still means creating a matching page under
// src/pages/projects/<slug>.astro; the slug here is what links to it.

export interface Project {
  slug: string;
  title: string;
  date: string;
  /** Language and scope, shown only on /projects, appended after the date. */
  stack: string;
  /** One line for the homepage: method first, finding last. */
  summary: string;
  /** The fuller two-to-three sentence version, used on /projects. */
  blurb: string;
}

export const projects: Project[] = [
  {
    slug: "kalshi-polymarket-microstructure",
    title: "Kalshi × Polymarket cross-venue microstructure",
    date: "May 2026",
    stack: "Python · live venue data",
    summary:
      "Live orderbook data across 16 paired markets: no takeable cross-venue arb after fees, and the two venues hold depth in structurally different ways.",
    blurb:
      "Empirical cross-venue microstructure pulling live Kalshi and Polymarket orderbook data across 16 paired markets, measuring spreads, depth, quote stability, and executable arb after fees. Finding: no takeable cross-venue arb at accessible fees; the venues differ structurally in how they hold depth.",
  },
  {
    slug: "orderbook-amm-hybrid-sim",
    title: "Order-book / AMM / hybrid venue simulator",
    date: "April 2026",
    stack: "Python · 900-run sweep",
    summary:
      "Agent-based sweep over AMM, CLOB, and hybrid venues: the hybrid halves agent-to-agent volume in every slice, because the passive LP layer absorbs the noise flow.",
    blurb:
      "Agent-based simulator stress-testing AMM, CLOB, and hybrid derivatives venues against event-driven Bayesian trader populations. Headline result: the hybrid mechanism halves agent-to-agent trade volume across every slice because the passive LP layer absorbs noise flow that would otherwise force informed traders into direct adverse selection.",
  },
  {
    slug: "dual-layer-liquidity",
    title: "Dual-layer on-chain liquidity protocol",
    date: "Jan–April 2026",
    stack: "Solidity, Python · live testnet",
    summary:
      "Permissioned SPV token plus an LS-LMSR market for price discovery on real-world assets; ≥97% convergence to true probability across a ~3,900-cell sweep.",
    blurb:
      "Permissioned ERC-3643 SPV token on Ethereum + LS-LMSR AMM on Base for price discovery on event-triggered real-world assets. Includes a seed-and-retreat cold-start mechanism, validated via a ~3,900-cell multi-agent parameter sweep showing ≥97% convergence to true probability under credentialed-dominant agent mixes.",
  },
];
