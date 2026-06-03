---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

The CV page is being updated.

For the most recent information, please contact me by email: [wangchenlu20@mails.ucas.ac.cn](mailto:wangchenlu20@mails.ucas.ac.cn).

Publications
======
{% if site.publications.size == 0 %}
Publication list is being updated. You can also visit my [Google Scholar profile]({{ site.author.googlescholar }}).
{% endif %}
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
Talks
======
{% if site.talks.size == 0 %}
Talks and presentations will be added soon.
{% endif %}
  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul>
  
Teaching
======
{% if site.teaching.size == 0 %}
Teaching activities will be added soon.
{% endif %}
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
