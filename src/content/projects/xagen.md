---
title: 'XAgen: Designing Explainability Support for Failure Detection and Correction in Multi-Agent Workflows'
short: XAgen
authors:
- Xinru Wang
- Zhuoran Lu
- Shuai Ma
- Ming Yin
- Eunyee Koh
- Mustafa Doga Dogan
venue: Design and Artificial Intelligence (Elsevier), 2026. Also presented as a poster at ACM CHI 2026
venueShort: Design & AI '26 · CHI '26 Poster
venueUrl: https://www.sciencedirect.com/journal/design-and-artificial-intelligence
year: 2026
order: 5
tags:
- ai-agents
vision:
- agentic
image: /images/projects/xagen.jpg
links:
- label: paper
  url: https://doi.org/10.1016/j.daai.2026.100105
- label: CHI '26 poster
  url: https://arxiv.org/pdf/2512.17896
---

The rapid adoption of LLM-powered multi-agent systems has brought users with diverse AI expertise—from software developers to domain experts—into the process of building and maintaining complex agentic workflows. Yet when these distributed systems fail, their non-deterministic and opaque nature makes it difficult for users to observe, attribute, and correct errors. To understand practitioners’ needs, we conducted formative interviews with 12 practitioners spanning AI developers who build agentic systems to domain experts who utilize them, surfacing five key challenge themes and four design goals for explainability tools. Building on these insights, we designed XAgen, an explainability interface that supports failure detection and correction through three capabilities: log visualization for glanceable workflow understanding, human-in-the-loop feedback to capture expert judgment, and automatic error identification via an LLM-as-a-judge. In a user evaluation with 8 participants, XAgen was rated significantly higher than a state-of-the-art observability baseline across all four dimensions—understanding, usability, helpfulness, and satisfaction—with median scores of 6–7 out of 7 (all p < 0.05). All three features were rated useful: log visualization received the highest helpfulness rating (median = 5/5, p < 0.01), followed by automatic error identification (median = 4.5/5, p < 0.05) and human-in-the-loop output feedback (median = 4/5, p = 0.07). Our findings yield empirically grounded design guidelines for explainable agentic AI and highlight open challenges for context-aware interactive debugging of multi-agent workflows.
