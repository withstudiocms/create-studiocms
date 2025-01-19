---
---

<head>
  <title>Index of /</title>
</head>

<body>
  <h1>Index of /</h1>
  <ul>
    {% assign top_level_dirs = "" | split: "," %}
    {% for file in site.static_files %}
      {% assign parts = file.path | split: "/" %}
      {% assign top_level = parts[0] %}
      {% if parts.size > 1 and parts[1] == "index.html" %}
        {% unless top_level_dirs contains top_level %}
          {% assign top_level_dirs = top_level_dirs | push: top_level %}
        {% endunless %}
      {% endif %}
    {% endfor %}

    {% for dir in top_level_dirs %}
    <li>
      <a href="{{ site.baseurl | escape }}/{{ dir }}/index.html">{{ dir }}</a>
    </li>
    {% endfor %}
  </ul>
  
  <pre>{% for file in site.static_files %}{{ file.path }}{% endfor %}</pre>
</body>
