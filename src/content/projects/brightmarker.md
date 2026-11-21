---
title: 'BrightMarker: 3D Printed Fluorescent Markers for Object Tracking'
short: BrightMarker
authors:
- Mustafa Doga Dogan
- Raul Garcia-Martin
- Patrick William Haertel
- Jamison John O’Keefe
- Ahmad Taka
- Akarsh Aurora
- Raul Sanchez-Reillo
- Stefanie Mueller
venue: 2023 ACM Symposium on User Interface Software and Technology (UIST)
venueShort: UIST '23
venueUrl: https://uist.acm.org/2023/
year: 2023
order: 18
tags:
- metadata
- fabrication
- xr
- sensing
vision:
- interior
featured: true
youtube: M5YNR6cVIiM
links:
- label: project page
  url: https://hcie.csail.mit.edu/research/brightmarker/brightmarker.html
- label: doi
  url: https://doi.org/10.1145/3586183.3606758
- label: paper
  url: /papers/2023-UIST-BrightMarker-paper.pdf
- label: video
  url: https://www.youtube.com/watch?v=M5YNR6cVIiM
- label: talk
  url: https://www.youtube.com/watch?v=GWMxs0Gy-E8&ab_channel=MITCSAILHCIEngineeringGroup
- label: 'open-source: GitHub'
  url: https://github.com/dogadogan/BrightMarker
press:
- name: MIT News
  url: https://news.mit.edu/2023/enhancing-3d-object-tracking-invisible-tagging-system-0815
- name: Hackster.io
  url: https://www.hackster.io/news/out-of-sight-6f57ce2a813a
- name: Hackaday
  url: https://hackaday.com/2023/08/17/fluorescent-filament-makes-object-identification-easier/
- name: SwissCognitive
  url: https://swisscognitive.ch/2023/08/19/invisible-tagging-system-enhances-3d-object-tracking/
---

Existing invisible object tagging methods are prone to low resolution, which impedes tracking performance. We present BrightMarker, a fabrication method that uses **fluorescent filaments** to embed **easily trackable markers** in 3D printed **color objects**. By using an infrared-fluorescent filament that “shifts” the wavelength of the incident light, our optical detection setup filters out all the noise to only have the markers present in the infrared camera image. The **high contrast** of the markers allows us to track them robustly regardless of the moving objects’ surface color.

We built a software interface for **automatically embedding** these markers for the input object geometry, and hardware modules that can be attached to existing **mobile devices** and **AR/VR headsets**. Our image processing pipeline robustly localizes the markers in real-time from the captured images. BrightMarker can be used in a variety of applications, such as custom fabricated wearables for motion capture, tangible interfaces for AR/VR, rapid product tracking, and privacy-preserving night vision. BrightMarker exceeds the detection rate of state-of-the-art invisible marking, and even small markers (1″x1″) can be tracked at distances exceeding 2m.
