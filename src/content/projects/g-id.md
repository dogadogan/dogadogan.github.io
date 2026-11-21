---
title: 'G-ID: Identifying 3D Prints Using Slicing Parameters'
short: G-ID
authors:
- M. Doga Dogan
- Faraz Faruqi
- Andrew Day Churchill
- Kenneth Friedman
- Leon Cheng
- Sriram Subramanian
- Stefanie Mueller
venue: 2020 ACM CHI Conference on Human Factors in Computing Systems
venueShort: CHI '20
venueUrl: https://chi2020.acm.org/
year: 2020
order: 23
tags:
- metadata
- fabrication
vision:
- structural
youtube: XsqLU6_78lc
links:
- label: project page
  url: https://hcie.csail.mit.edu/research/gid/gid.html
- label: doi
  url: https://doi.org/10.1145/3313831.3376202
- label: paper
  url: /papers/G-ID-CHI-2020.pdf
- label: video
  url: https://www.youtube.com/watch?v=XsqLU6_78lc
- label: talk
  url: https://www.youtube.com/watch?v=gKueHVbQfWo
press:
- name: 3DPrint.com
  url: http://3dprint.com/267406/infill-identifying-3d-printed-parts-with-slicing-parameters/
- name: Hackster.io
  url: https://www.hackster.io/news/this-app-can-identify-3d-prints-based-on-their-slicing-parameters-6ef23ee4526c
- name: ITmedia
  url: https://www.itmedia.co.jp/news/articles/2005/29/news137.html
---

G-ID is a method that utilizes the **subtle patterns left by the 3D printing process to distinguish and identify objects that otherwise look similar to the human eye**. The key idea is to mark different instances of a 3D model by varying slicing parameters that do not change the model geometry but can be detected as **machine-readable differences** in the print. As a result, G-ID does not add anything to the object but exploits the patterns appearing as a byproduct of slicing, an essential step of the 3D printing pipeline. We introduce the G-ID slicing & labeling interface that varies the settings for each instance, and the G-ID mobile app, which uses image processing techniques to retrieve the parameters and their associated labels from a photo of the 3D printed object. Finally, we evaluate our method’s accuracy under different lighting conditions, when objects were printed with different filaments and printers, and with pictures taken from various positions and angles.
