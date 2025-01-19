---
---

<head>
  <title>Index of /</title>
</head>

<body>
  <h1>Index of /</h1>
  <ul>
    {% assign dirs = "" | split: "," %}
    {% for file in site.static_files %}
      {% assign parts = file.path | split: "/" %}
      {% assign first = parts[0] %}
      {% if parts.size > 1 and parts[1] == "index.html" %}
        {% unless dirs contains first %}
          {% assign dirs = dirs | push: first %}
        {% endunless %}
      {% endif %}
    {% endfor %}
    {% for dir in dirs %}
    <li>
      <a href="{{ site.baseurl | escape }}/{{ dir }}/index.html">{{ dir }}</a>
    </li>
    {% endfor %}
  </ul>
</body>
