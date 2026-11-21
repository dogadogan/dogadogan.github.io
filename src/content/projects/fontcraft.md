---
title: 'FontCraft: Multimodal Font Design Using Interactive Bayesian Optimization'
short: FontCraft
authors:
- Yuki Tatsukawa
- I-Chao Shen
- Mustafa Doga Dogan
- Anran Qi
- Yuki Koyama
- Ariel Shamir
- Takeo Igarashi
venue: 2025 ACM CHI Conference on Human Factors in Computing Systems
venueShort: CHI '25
venueUrl: https://chi2025.acm.org/
year: 2025
order: 12
tags:
- design-tools
- ai-agents
youtube: KKSJQkWfS5o
links:
- label: project page
  url: https://yukistavailable.github.io/fontcraft.github.io/
- label: paper
  url: https://arxiv.org/pdf/2502.11399
- label: talk
  url: https://www.youtube.com/watch?v=nqqhNLH43lI
- label: video
  url: https://www.youtube.com/watch?v=KKSJQkWfS5o
---

Creating new fonts requires a lot of human effort and professional typographic knowledge. Despite the rapid advancements of automatic font generation models, existing methods require users to prepare pre-designed characters with target styles using font-editing software, which poses a problem for non-expert users. To address this limitation, we propose FontCraft, a system that enables *font generation **without relying on pre-designed characters***. Our approach integrates the exploration of a font-style latent space with **human-in-the-loop preferential Bayesian optimization** and **multimodal references**, facilitating efficient exploration and enhancing user control. Moreover, FontCraft allows users to revisit previous designs, retracting their earlier choices in the preferential Bayesian optimization process. Once users finish editing the style of a selected character, they can *propagate it to the remaining characters a*nd further refine them as needed. The system then generates a complete outline font in *OpenType* format. We evaluated the effectiveness of FontCraft through a user study comparing it to a baseline interface. Results from both quantitative and qualitative evaluations demonstrate that FontCraft enables non-expert users to design fonts efficiently.
