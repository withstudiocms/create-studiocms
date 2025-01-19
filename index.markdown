---
---

<head>
  <title>Index of /</title>
</head>

<body>
  <h1>Index of /</h1>
  <ul>
  {% for url in site.static_files %}
    {% if url.path contains '/index.html' %}
      {% assign name = url.path | split: "/" | first %}
      <li><a href="{{ site.baseurl | escape }}{{ url.path | escape }}">{{ name }}</a> </li>
    {% endif %}
  {% endfor %}
  </ul>
</body>
