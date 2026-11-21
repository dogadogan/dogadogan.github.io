---
title: 'InfraredTags: Invisible AR Markers & Barcodes Using Low-Cost, Infrared-Based 3D Printing & Imaging Tools'
short: InfraredTags
authors:
- M. Doga Dogan
- Ahmad Taka
- Michael Lu
- Yunyi Zhu
- Akshat Kumar
- Aakar Gupta
- Stefanie Mueller
venue: 2022 ACM CHI Conference on Human Factors in Computing Systems
venueShort: CHI '22
venueUrl: https://chi2022.acm.org/
year: 2022
order: 21
tags:
- metadata
- fabrication
- xr
- sensing
vision:
- interior
featured: true
award: Best Demo Honorable Mention
youtube: Tjs1zH7IMxE
links:
- label: project page
  url: https://hcie.csail.mit.edu/research/infraredtags/infraredtags.html
- label: doi
  url: https://dl.acm.org/doi/10.1145/3491102.3501951
- label: paper
  url: /papers/InfraredTags-CHI-2022.pdf
- label: video
  url: https://www.youtube.com/watch?v=Tjs1zH7IMxE
- label: talk
  url: https://www.youtube.com/watch?v=61n4RrsKoBo
- label: 'open-source: GitHub'
  url: https://github.com/dogadogan/InfraredTags
press:
- name: Popular Science
  url: https://www.popsci.com/technology/mit-facebook-infrared-tags/
- name: New Scientist
  url: https://www.newscientist.com/article/2319877-invisible-3d-printed-tags-turn-simple-objects-into-gaming-controllers/
- name: MIT News
  url: https://news.mit.edu/2022/invisible-labels-identify-track-objects-0128
---

Existing approaches for embedding unobtrusive tags inside 3D objects require either complex fabrication or high-cost imaging equipment. We present InfraredTags, which are **2D codes and markers imperceptible to the naked eye** that can be 3D printed as part of objects, and detected rapidly by **low-cost near-infrared cameras**. InfraredTags achieve this by being printed from an **infrared-transmitting filament** which infrared cameras can see through, and by having air gaps inside for the tag’s bits which infrared cameras capture as darker pixels in the image. We built a user interface that facilitates the integration of common tags (**QR codes, ArUco markers**) with the object geometry to make them 3D printable as InfraredTags. We also developed a low-cost infrared imaging module that **augments existing mobile devices** and decodes tags using our image processing pipeline. We demonstrate how our method enables applications, such as **object tracking** and **embedding metadata for augmented reality and tangible interactions**.
